import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { Head } from "@inertiajs/react";
import { useState } from "react";

export default function Home({ events }) {
    const employeeToColor = events.reduce((acc, event) => {
        if (event.employee && event.backgroundColor) {
            acc[event.employee] = event.backgroundColor;
        }

        return acc;
    }, {});

    console.log(employeeToColor);

    const [hiddenEmployees, setHiddenEmployees] = useState([]);

    function toggleEmployee(employee) {
        setHiddenEmployees((current) =>
            current.includes(employee)
                ? current.filter((name) => name !== employee)
                : [...current, employee]
        );
    }

    return (
        <AuthenticatedLayout>
            <Head title="Home page" />

            <div className="flex items-center gap-2 p-2">
                <div className="bg-white m-auto w-[15vw] flex flex-col gap-2 p-2 rounded-md">
                    {Object.entries(employeeToColor).map(([employee, color]) => (
                        <div
                            key={employee}
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => toggleEmployee(employee)}
                        >
                            <div
                                className="h-3 w-3 rounded-sm"
                                style={{
                                    backgroundColor: color,
                                    opacity: hiddenEmployees.includes(employee) ? .25 : 1
                                }}
                            />
                            <span className={`truncate ${hiddenEmployees.includes(employee) ? "line-through opacity-25" : ""}`}>
                                {employee}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="py-12 w-[85vw]">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="overflow-hidden bg-white shadow-xs sm:rounded-lg">
                            <div className="p-4 sm:p-6">
                                <FullCalendar
                                    plugins={[timeGridPlugin]}
                                    initialView="timeGridWeek"
                                    slotDuration="00:15:00"
                                    events={events}
                                    locale="pt-br"
                                    dayHeaderFormat={{
                                        weekday: 'long',
                                        day: 'numeric'
                                    }}
                                    slotLabelFormat={{
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: false,
                                    }}
                                    allDaySlot={false}
                                    scrollTime="8:00:00"
                                    height={700}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
