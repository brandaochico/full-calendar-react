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
            '#6A041D',
            '#F5B841',
            '#F4FF52',
            '#53FF45',
            '#1E2EDE',
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
