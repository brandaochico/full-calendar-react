<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        $appointments = Appointment::with(['client', 'employee', 'blocks'])->get();

        $employees = $appointments->pluck('employee')
            ->filter()
            ->unique('id')
            ->sortBy('id')
            ->values();

        $colors = [
            '#B96A5B',
            '#A97845',
            '#9B8A3C',
            '#7E9650',
            '#5F8F73',
            '#866EB8',
            '#5D7FBA',
            '#8A675C',
            '#B26883',
            '#D38A5D',
            '#C89B47',
        ];

        $employeesColors = [];
        foreach ($employees as $index => $employee) {
            $colorIndex = $index % count($colors);
            $employeesColors[$employee->id] = $colors[$colorIndex];
        }

        $timeGridEvents = $appointments
            ->flatMap(fn (Appointment $appointment) => $this->buildTimeGridEvents($appointment, $employeesColors))
            ->values()
            ->all();

        $monthEvents = $appointments
            ->map(fn (Appointment $appointment) => $this->buildMonthEvent($appointment, $employeesColors))
            ->values()
            ->all();

        return Inertia::render('Home', compact('timeGridEvents', 'monthEvents'));
    }

    private function buildTimeGridEvents(Appointment $appointment, array $employeesColors): Collection
    {
        $baseEvent = $this->buildBaseEvent($appointment, $employeesColors);
        $blocks = $appointment->blocks->sortBy('start_time')->values();

        if ($blocks->isEmpty()) {
            return collect([
                [
                    'id' => 'appointment-'.$appointment->id,
                    'title' => $baseEvent['title'],
                    'start' => $this->toCalendarDate($appointment->start_time),
                    'end' => $this->toCalendarDate($appointment->finish_time),
                    'backgroundColor' => $baseEvent['backgroundColor'],
                    'extendedProps' => [
                        ...$baseEvent['extendedProps'],
                        'kind' => 'appointment-segment',
                        'segmentPosition' => 'single',
                        'segmentIndex' => 0,
                    ],
                ],
            ]);
        }

        $segments = collect();
        $cursor = $appointment->start_time->copy();
        $segmentIndex = 0;

        foreach ($blocks as $block) {
            $blockStart = $block->start_time->greaterThan($appointment->start_time)
                ? $block->start_time->copy()
                : $appointment->start_time->copy();
            $blockEnd = $block->finish_time->lessThan($appointment->finish_time)
                ? $block->finish_time->copy()
                : $appointment->finish_time->copy();
            $effectiveBlockStart = $blockStart->greaterThan($cursor)
                ? $blockStart
                : $cursor->copy();

            if ($cursor->lt($effectiveBlockStart)) {
                $segments->push([
                    'id' => 'appointment-segment-'.$appointment->id.'-'.$segmentIndex,
                    'title' => $baseEvent['title'],
                    'start' => $this->toCalendarDate($cursor),
                    'end' => $this->toCalendarDate($effectiveBlockStart),
                    'backgroundColor' => $baseEvent['backgroundColor'],
                    'extendedProps' => [
                        ...$baseEvent['extendedProps'],
                        'kind' => 'appointment-segment',
                        'segmentPosition' => 'middle',
                        'segmentIndex' => $segmentIndex,
                    ],
                ]);

                $segmentIndex++;
            }

            if ($effectiveBlockStart->lt($blockEnd)) {
                $segments->push([
                    'id' => 'block-'.$block->id,
                    'title' => $block->label,
                    'start' => $this->toCalendarDate($effectiveBlockStart),
                    'end' => $this->toCalendarDate($blockEnd),
                    'backgroundColor' => $baseEvent['backgroundColor'],
                    'extendedProps' => [
                        ...$baseEvent['extendedProps'],
                        'kind' => 'block',
                        'blockId' => $block->id,
                        'blockLabel' => $block->label,
                    ],
                ]);
            }

            $cursor = $blockEnd->copy();
        }

        if ($cursor->lt($appointment->finish_time)) {
            $segments->push([
                'id' => 'appointment-segment-'.$appointment->id.'-'.$segmentIndex,
                'title' => $baseEvent['title'],
                'start' => $this->toCalendarDate($cursor),
                'end' => $this->toCalendarDate($appointment->finish_time),
                'backgroundColor' => $baseEvent['backgroundColor'],
                'extendedProps' => [
                    ...$baseEvent['extendedProps'],
                    'kind' => 'appointment-segment',
                    'segmentPosition' => 'middle',
                    'segmentIndex' => $segmentIndex,
                ],
            ]);
        }

        return $this->normalizeSegmentPositions($segments);
    }

    private function buildMonthEvent(Appointment $appointment, array $employeesColors): array
    {
        $baseEvent = $this->buildBaseEvent($appointment, $employeesColors);
        $blockCount = $appointment->blocks->count();

        return [
            'id' => 'appointment-month-'.$appointment->id,
            'title' => $baseEvent['title'],
            'start' => $this->toCalendarDate($appointment->start_time),
            'end' => $this->toCalendarDate($appointment->finish_time),
            'backgroundColor' => $baseEvent['backgroundColor'],
            'extendedProps' => [
                ...$baseEvent['extendedProps'],
                'kind' => 'appointment-month-summary',
                'blockCount' => $blockCount,
                'blockLabels' => $appointment->blocks->pluck('label')->values()->all(),
            ],
        ];
    }

    private function buildBaseEvent(Appointment $appointment, array $employeesColors): array
    {
        $employeeId = $appointment->employee?->id;

        return [
            'title' => $appointment->client->name.' ('.$appointment->employee->name.')',
            'backgroundColor' => $employeesColors[$employeeId] ?? null,
            'extendedProps' => [
                'appointmentId' => $appointment->id,
                'client' => $appointment->client->name,
                'employee' => $appointment->employee?->name,
                'originalStart' => $this->toCalendarDate($appointment->start_time),
                'originalEnd' => $this->toCalendarDate($appointment->finish_time),
            ],
        ];
    }

    private function toCalendarDate(CarbonInterface $date): string
    {
        return $date->toIso8601String();
    }

    private function normalizeSegmentPositions(Collection $events): Collection
    {
        $segmentKeys = $events->keys()->filter(
            fn (int $key) => $events[$key]['extendedProps']['kind'] === 'appointment-segment'
        )->values();

        $segmentCount = $segmentKeys->count();

        return $events->map(function (array $event, int $key) use ($segmentCount, $segmentKeys) {
            if ($event['extendedProps']['kind'] !== 'appointment-segment') {
                return $event;
            }

            $segmentOrder = $segmentKeys->search($key);

            $event['extendedProps']['segmentPosition'] = match (true) {
                $segmentCount === 1 => 'single',
                $segmentOrder === 0 => 'start',
                $segmentOrder === $segmentCount - 1 => 'end',
                default => 'middle',
            };

            return $event;
        })->values();
    }
}
