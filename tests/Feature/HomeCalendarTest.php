<?php

namespace Tests\Feature;

use Database\Seeders\AppointmentSeeder;
use Database\Seeders\BlockSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class HomeCalendarTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_page_projects_appointments_and_blocks_for_the_calendar(): void
    {
        $this->seed([
            AppointmentSeeder::class,
            BlockSeeder::class,
        ]);

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Home')
                ->has('timeGridEvents', 18)
                ->has('monthEvents', 14)
                ->where('timeGridEvents.1.extendedProps.kind', 'block')
                ->where('timeGridEvents.1.title', 'Bloqueio interno')
                ->where('timeGridEvents.1.extendedProps.appointmentId', 1)
                ->where('monthEvents.0.extendedProps.blockCount', 1)
                ->where('monthEvents.0.extendedProps.kind', 'appointment-month-summary'));
    }
}
