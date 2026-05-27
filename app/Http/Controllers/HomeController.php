<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        $events = Appointment::with(['client', 'employee'])
            ->get()
            ->map(fn (Appointment $appointment) => [
                'title' => $appointment->client->name.' ('.$appointment->employee->name.')',
                'start' => $appointment->start_time,
                'end' => $appointment->finish_time,
            ])
            ->all();

        return Inertia::render('Home', [
            'events' => $events,
        ]);
    }
}
