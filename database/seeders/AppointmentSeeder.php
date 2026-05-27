<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Client;
use App\Models\Employee;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;

class AppointmentSeeder extends Seeder
{
    public function run(): void
    {
        $weekStart = CarbonImmutable::now()->startOfWeek();
        $seededAt = $weekStart->subDay()->setTime(7, 27, 12)->toDateTimeString();

        $clientNames = [
            'Ana Souza',
            'Bruno Lima',
            'Carla Mendes',
            'Diego Rocha',
            'Elisa Martins',
            'Felipe Alves',
            'Gabriela Costa',
            'Henrique Nunes',
            'Isabela Ramos',
            'Joao Pedro',
            'Karen Freitas',
            'Lucas Teixeira',
            'Mariana Araujo',
            'Nicolas Barros',
        ];

        $employeeNames = [
            'Amanda Silva',
            'Beatriz Gomes',
            'Caio Santos',
            'Daniela Cruz',
            'Eduardo Melo',
            'Fernanda Pires',
            'Guilherme Dias',
            'Helena Castro',
            'Igor Cardoso',
            'Juliana Rezende',
            'Leonardo Vieira',
            'Milena Moura',
            'Natanael Torres',
            'Patricia Faria',
        ];

        $schedule = [
            ['day' => 0, 'start' => '08:00', 'finish' => '11:00'],
            ['day' => 0, 'start' => '15:00', 'finish' => '18:00'],
            ['day' => 1, 'start' => '12:00', 'finish' => '15:00'],
            ['day' => 1, 'start' => '17:00', 'finish' => '18:00'],
            ['day' => 2, 'start' => '11:00', 'finish' => '15:00'],
            ['day' => 2, 'start' => '16:00', 'finish' => '18:00'],
            ['day' => 3, 'start' => '08:00', 'finish' => '12:00'],
            ['day' => 3, 'start' => '16:00', 'finish' => '19:00'],
            ['day' => 4, 'start' => '08:00', 'finish' => '11:00'],
            ['day' => 4, 'start' => '15:00', 'finish' => '17:00'],
            ['day' => 5, 'start' => '12:00', 'finish' => '16:00'],
            ['day' => 5, 'start' => '16:00', 'finish' => '18:00'],
            ['day' => 6, 'start' => '09:00', 'finish' => '12:00'],
            ['day' => 6, 'start' => '16:00', 'finish' => '18:00'],
        ];

        Appointment::query()->delete();
        Client::query()->delete();
        Employee::query()->delete();

        Client::insert(array_map(
            fn (string $name, int $index) => [
                'id' => $index + 1,
                'name' => $name,
                'created_at' => $seededAt,
                'updated_at' => $seededAt,
            ],
            $clientNames,
            array_keys($clientNames),
        ));

        Employee::insert(array_map(
            fn (string $name, int $index) => [
                'id' => $index + 1,
                'name' => $name,
                'created_at' => $seededAt,
                'updated_at' => $seededAt,
            ],
            $employeeNames,
            array_keys($employeeNames),
        ));

        Appointment::insert(array_map(
            function (array $slot, int $index) use ($weekStart, $seededAt) {
                $date = $weekStart->addDays($slot['day']);

                return [
                    'id' => $index + 1,
                    'start_time' => $date->setTimeFromTimeString($slot['start'])->toDateTimeString(),
                    'finish_time' => $date->setTimeFromTimeString($slot['finish'])->toDateTimeString(),
                    'comments' => null,
                    'client_id' => $index + 1,
                    'employee_id' => $index + 1,
                    'created_at' => $seededAt,
                    'updated_at' => $seededAt,
                ];
            },
            $schedule,
            array_keys($schedule),
        ));
    }
}
