import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { Head } from "@inertiajs/react";
import { useState } from "react";

export default function Home({ events }) {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [showActions, setShowActions] = useState(false);

    function openModal(eventData) {
        setSelectedEvent(eventData);
        setModalVisible(false);
        setShowActions(false);

        requestAnimationFrame(() => {
            setModalVisible(true);
            setShowActions(true);
        });
    }

    function closeModal() {
        setShowActions(false);
        setModalVisible(false);

        setTimeout(() => {
            setSelectedEvent(null);
        }, 300);
    }

    // linking employee to their color
    const employeeToColor = events.reduce((acc, event) => {
        if (event.employee && event.backgroundColor) {
            acc[event.employee] = event.backgroundColor;
        }

        return acc;
    }, {});

    // employees that should not have their schedule shown on the calendar
    const [hiddenEmployees, setHiddenEmployees] = useState([]);
    function toggleEmployee(employee) {
        setHiddenEmployees((current) =>
            current.includes(employee)
                ? current.filter((name) => name !== employee)
                : [...current, employee]
        );
    }

    // adding isHidden prop to event in order to decrease opacity when employee is hidden
    const calendarEvents = events.map((event) => ({
        ...event,
        isHidden: hiddenEmployees.includes(event.employee),
    }));

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
                                    events={calendarEvents}
                                    eventDidMount={(info) => {
                                        info.el.style.opacity = info.event.extendedProps.isHidden ? .25 : 1;
                                        info.el.style.cursor = info.event.extendedProps.isHidden ? "not-allowed" : "pointer"
                                    }}
                                    eventClick={(info) => {
                                        openModal({
                                            title: info.event.title,
                                            start: info.event.start,
                                            end: info.event.end,
                                            employee: info.event.extendedProps.employee,
                                            backgroundColor: employeeToColor[info.event.extendedProps.employee],
                                        });
                                    }}
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

            {selectedEvent &&
                <div
                    className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm
                        transition-opacity duration-300 ${modalVisible ? "opacity-100" : "opacity-0"}`}
                    onClick={closeModal}
                >
                    <div className="flex gap-3">
                        <div
                            className={`w-[20vw] h-[50vh] max-w-md rounded-md p-6 shadow-lg
                                flex flex-col justify-between
                                transition-all duration-300 ${modalVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
                            style={{ backgroundColor: selectedEvent.backgroundColor }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div>
                                <h2 className="text-lg font-semibold text-white">{selectedEvent.employee}</h2>
                                <p className="mt-2 text-sm text-gray-300">
                                    Início: {selectedEvent.start.toLocaleString("pt-BR")}
                                </p>
                                <p className="mt-2 text-sm text-gray-300">
                                    Fim: {selectedEvent.end.toLocaleString("pt-BR")}
                                </p>
                            </div>

                            <div className="mt-4 flex justify-end">
                                <button
                                    type="button"
                                    className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white cursor-pointer"
                                    onClick={closeModal}
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                        <div className={`flex flex-col gap-2 transition-all duration-500 ease-out ${showActions ? "translate-x-0 opacity-100" : "-translate-x-6 opacity-0"
                            }`}>
                            <button
                                type="button"
                                className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white cursor-pointer"
                                onClick={closeModal}
                            >
                                Fechar
                            </button>
                            <button
                                type="button"
                                className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white cursor-pointer"
                                onClick={closeModal}
                            >
                                Fechar
                            </button>
                            <button
                                type="button"
                                className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white cursor-pointer"
                                onClick={closeModal}
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            }

        </AuthenticatedLayout >
    );
}
