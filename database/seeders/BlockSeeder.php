<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Block;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;

class BlockSeeder extends Seeder
{
    public function run(): void
    {
        Block::query()->delete();

        $appointments = Appointment::query()
            ->orderBy('start_time')
            ->take(5)
            ->get();

        if ($appointments->count() < 5) {
            return;
        }

        $seededAt = CarbonImmutable::now()->toDateTimeString();

        $firstAppointment = $appointments[0];
        $secondAppointment = $appointments[4];

        Block::insert([
            [
                'appointment_id' => $firstAppointment->id,
                'start_time' => $firstAppointment->start_time->copy()->addMinutes(45)->toDateTimeString(),
                'finish_time' => $firstAppointment->start_time->copy()->addMinutes(90)->toDateTimeString(),
                'label' => 'Bloqueio interno',
                'created_at' => $seededAt,
                'updated_at' => $seededAt,
            ],
            [
                'appointment_id' => $secondAppointment->id,
                'start_time' => $secondAppointment->start_time->copy()->addMinutes(60)->toDateTimeString(),
                'finish_time' => $secondAppointment->start_time->copy()->addMinutes(105)->toDateTimeString(),
                'label' => 'Intervalo de encaixe',
                'created_at' => $seededAt,
                'updated_at' => $seededAt,
            ],
        ]);
    }
}
