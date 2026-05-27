import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { Head } from "@inertiajs/react";

export default function Home({ events }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Home page
                </h2>
            }
        >
            <Head title="Home page" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-xs sm:rounded-lg">
                        <div className="p-4 sm:p-6">
                            <FullCalendar
                                plugins={[timeGridPlugin]}
                                initialView="timeGridWeek"
                                slotMinTime="08:00:00"
                                slotMaxTime="19:00:00"
                                events={events}
                                height="auto"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
