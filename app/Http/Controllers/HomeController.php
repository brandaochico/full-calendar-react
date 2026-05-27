<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        $appointments = Appointment::with(['client', 'employee'])->get();

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
            '#C27A62',
        ];

        $employeesColors = [];
        foreach ($employees as $index => $employee) {
            $colorIndex = $index % count($colors);
            $employeesColors[$employee->id] = $colors[$colorIndex];
        }

        $events = $appointments->map(function ($appointment) use ($employeesColors) {
            $employeeId = $appointment->employee?->id;

            return [
                'title' => $appointment->client->name . ' (' . $appointment->employee->name . ')',
                'employee' => $appointment->employee?->name,
                'start' => $appointment->start_time,
                'end' => $appointment->finish_time,
                'backgroundColor' => $employeesColors[$employeeId] ?? null,
            ];
        })->values()->all();

        return Inertia::render('Home', compact('events'));
    }
}
