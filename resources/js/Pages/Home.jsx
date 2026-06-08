import InputError from "@/Components/InputError";
import TextInput from "@/Components/TextInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { Head, useForm } from "@inertiajs/react";
import { useCallback, useEffect, useMemo, useState } from "react";

const modalSteps = {
    createBlock: "create-block",
    details: "details",
};

function formatTimeInput(value) {
    const digits = value.replace(/\D/g, "").slice(0, 4);

    if (digits.length <= 2) {
        return digits;
    }

    return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function formatHourMinute(date) {
    return new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(date);
}

function buildBlockDateTime(baseDate, time) {
    if (!baseDate || !/^\d{2}:\d{2}$/.test(time)) {
        return "";
    }

    const [hour, minute] = time.split(":");
    const nextDate = new Date(baseDate);

    nextDate.setHours(Number(hour), Number(minute), 0, 0);

    return nextDate.toISOString();
}

export default function Home({ timeGridEvents, monthEvents }) {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const [currentView, setCurrentView] = useState("timeGridWeek");
    const [modalStep, setModalStep] = useState(modalSteps.details);
    const [hiddenEmployees, setHiddenEmployees] = useState([]);
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
        transform,
    } =
        useForm({
            appointment_id: "",
            start_time: "",
            finish_time: "",
        });

    const resetBlockForm = useCallback(() => {
        reset();
        clearErrors();
    }, [clearErrors, reset]);

    const openModal = useCallback(
        (eventData) => {
            setSelectedEvent(eventData);
            setModalStep(modalSteps.details);
            resetBlockForm();
            setModalVisible(false);
            setShowActions(false);

            requestAnimationFrame(() => {
                setModalVisible(true);
                setShowActions(true);
            });
        },
        [resetBlockForm],
    );

    const closeModal = useCallback(() => {
        setShowActions(false);
        setModalVisible(false);
        setModalStep(modalSteps.details);
        resetBlockForm();

        setTimeout(() => {
            setSelectedEvent(null);
        }, 300);
    }, [resetBlockForm]);

    function toggleEmployee(employee) {
        setHiddenEmployees((current) =>
            current.includes(employee)
                ? current.filter((name) => name !== employee)
                : [...current, employee],
        );
    }

    const employeeToColor = useMemo(
        () =>
            [...timeGridEvents, ...monthEvents].reduce((acc, event) => {
                if (event.extendedProps.employee && event.backgroundColor) {
                    acc[event.extendedProps.employee] = event.backgroundColor;
                }

                return acc;
            }, {}),
        [monthEvents, timeGridEvents],
    );

    const visibleTimeGridEvents = useMemo(
        () =>
            timeGridEvents.map((event) => ({
                ...event,
                extendedProps: {
                    ...event.extendedProps,
                    isHidden: hiddenEmployees.includes(
                        event.extendedProps.employee,
                    ),
                },
            })),
        [hiddenEmployees, timeGridEvents],
    );

    const visibleMonthEvents = useMemo(
        () =>
            monthEvents.map((event) => ({
                ...event,
                extendedProps: {
                    ...event.extendedProps,
                    isHidden: hiddenEmployees.includes(
                        event.extendedProps.employee,
                    ),
                },
            })),
        [hiddenEmployees, monthEvents],
    );

    const calendarEvents = useMemo(
        () =>
            currentView === "dayGridMonth"
                ? visibleMonthEvents
                : visibleTimeGridEvents,
        [currentView, visibleMonthEvents, visibleTimeGridEvents],
    );

    useEffect(() => {
        const { overflow } = document.body.style;

        if (selectedEvent) {
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.body.style.overflow = overflow;
        };
    }, [selectedEvent]);

    function toTitleCase(text) {
        return text
            .split("-")
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join("-");
    }

    function addDays(date, days) {
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + days);
        return nextDate;
    }

    function addMonths(date, months) {
        const nextDate = new Date(date);
        nextDate.setMonth(nextDate.getMonth() + months);
        return nextDate;
    }

    function startOfDay(date) {
        const nextDate = new Date(date);
        nextDate.setHours(0, 0, 0, 0);
        return nextDate;
    }

    const dayHeaderContent = useCallback((args) => {
        const weekday = new Intl.DateTimeFormat("pt-BR", {
            weekday: "long",
        }).format(args.date);

        return toTitleCase(weekday);
    }, []);

    const buildModalData = useCallback((calendarEvent) => {
        const {
            appointmentId,
            blockCount,
            blockId,
            blockLabel,
            blockLabels,
            client,
            employee,
            kind,
            originalEnd,
            originalStart,
        } = calendarEvent.extendedProps;

        return {
            appointmentId,
            backgroundColor: calendarEvent.backgroundColor,
            blockCount,
            blockId,
            blockLabel,
            blockLabels: blockLabels ?? [],
            client,
            employee,
            end: calendarEvent.end,
            kind,
            originalEnd: originalEnd
                ? new Date(originalEnd)
                : calendarEvent.end,
            originalStart: originalStart
                ? new Date(originalStart)
                : calendarEvent.start,
            start: calendarEvent.start,
            title: calendarEvent.title,
        };
    }, []);

    const renderEventContent = useCallback((info) => {
        const { blockCount, client, kind } = info.event.extendedProps;
        const isMonthView = info.view.type === "dayGridMonth";

        if (kind === "block") {
            return (
                <div className="fc-event-content fc-event-content--block">
                    <span className="fc-event-title">Bloqueio</span>
                    {!isMonthView && (
                        <span className="fc-event-subtitle">
                            {info.timeText}
                        </span>
                    )}
                </div>
            );
        }

        if (isMonthView) {
            return (
                <div className="fc-event-content">
                    <span className="fc-event-title">{client}</span>
                    {blockCount > 0 && (
                        <span className="fc-event-badge">
                            {blockCount} bloqueio{blockCount > 1 ? "s" : ""}
                        </span>
                    )}
                </div>
            );
        }

        return (
            <div className="fc-event-content">
                <span className="fc-event-title">{client}</span>
                <span className="fc-event-subtitle">{info.timeText}</span>
            </div>
        );
    }, []);

    const eventClassNames = useCallback((info) => {
        const { isHidden, kind, segmentPosition } = info.event.extendedProps;

        return [
            "fc-event-card",
            `fc-event--${kind}`,
            segmentPosition ? `fc-event--${segmentPosition}` : null,
            isHidden ? "fc-event--hidden" : null,
        ].filter(Boolean);
    }, []);

    const handleEventClick = useCallback(
        (info) => {
            if (!hiddenEmployees.includes(info.event.extendedProps.employee)) {
                openModal(buildModalData(info.event));
            }
        },
        [buildModalData, hiddenEmployees, openModal],
    );

    const handleDatesSet = useCallback((info) => {
        setCurrentView(info.view.type);
    }, []);

    const openBlockForm = useCallback(() => {
        if (!selectedEvent?.appointmentId) {
            return;
        }

        resetBlockForm();
        setData("appointment_id", String(selectedEvent.appointmentId));
        setModalStep(modalSteps.createBlock);
    }, [resetBlockForm, selectedEvent, setData]);

    const handleBackToDetails = useCallback(() => {
        resetBlockForm();
        if (selectedEvent?.appointmentId) {
            setData("appointment_id", String(selectedEvent.appointmentId));
        }
        setModalStep(modalSteps.details);
    }, [resetBlockForm, selectedEvent, setData]);

    const handleTimeFieldChange = useCallback(
        (field, value) => {
            setData(field, formatTimeInput(value));
        },
        [setData],
    );

    const submitBlockForm = useCallback(
        (e) => {
            e?.preventDefault();

            if (!selectedEvent?.appointmentId) {
                return;
            }

            transform((formData) => ({
                ...formData,
                start_at: buildBlockDateTime(
                    selectedEvent.originalStart,
                    formData.start_time,
                ),
                finish_at: buildBlockDateTime(
                    selectedEvent.originalStart,
                    formData.finish_time,
                ),
            }));

            post(route("blocks.store"), {
                preserveScroll: true,
                preserveState: "errors",
                onSuccess: () => {
                    closeModal();
                },
            });
        },
        [closeModal, post, selectedEvent, transform],
    );

    const canCreateBlock = selectedEvent && selectedEvent.kind !== "block";
    const originalAppointmentRange = selectedEvent
        ? `${formatHourMinute(selectedEvent.originalStart)} - ${formatHourMinute(selectedEvent.originalEnd)}`
        : "";

    return (
        <AuthenticatedLayout>
            <Head title="Home page" />

            <div className="flex items-center gap-2 p-2">
                <div className="m-auto flex w-[15vw] flex-col gap-2 rounded-md bg-white p-2">
                    {Object.entries(employeeToColor).map(
                        ([employee, color]) => (
                            <div
                                key={employee}
                                className="flex cursor-pointer items-center gap-2"
                                onClick={() => toggleEmployee(employee)}
                            >
                                <div
                                    className="h-3 w-3 rounded-sm"
                                    style={{
                                        backgroundColor: color,
                                        opacity: hiddenEmployees.includes(
                                            employee,
                                        )
                                            ? 0.25
                                            : 1,
                                    }}
                                />
                                <span
                                    className={`truncate ${
                                        hiddenEmployees.includes(employee)
                                            ? "line-through opacity-25"
                                            : ""
                                    }`}
                                >
                                    {employee}
                                </span>
                            </div>
                        ),
                    )}
                </div>

                <div className="w-[85vw] py-12">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="overflow-hidden bg-white shadow-xs sm:rounded-lg">
                            <div className="p-4 sm:p-6">
                                <FullCalendar
                                    plugins={[timeGridPlugin, dayGridPlugin]}
                                    initialView="timeGridWeek"
                                    headerToolbar={{
                                        left: "dayGridMonth,timeGridWeek,timeGridDay",
                                        center: "title",
                                        right: "today prev,next",
                                    }}
                                    dayHeaderContent={dayHeaderContent}
                                    buttonText={{
                                        today: "Hoje",
                                        month: "Mês",
                                        week: "Semana",
                                        day: "Dia",
                                    }}
                                    slotDuration="00:15:00"
                                    scrollTimeReset={false}
                                    events={calendarEvents}
                                    eventClassNames={eventClassNames}
                                    eventContent={renderEventContent}
                                    eventClick={handleEventClick}
                                    datesSet={handleDatesSet}
                                    locale="pt-br"
                                    slotLabelFormat={{
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: false,
                                    }}
                                    allDaySlot={false}
                                    scrollTime="8:00:00"
                                    height={700}
                                    views={{
                                        timeGridWeek: {
                                            validRange(nowDate) {
                                                const baseDate =
                                                    startOfDay(nowDate);
                                                return {
                                                    start: addDays(
                                                        baseDate,
                                                        -14,
                                                    ),
                                                    end: addDays(baseDate, 15),
                                                };
                                            },
                                        },
                                        timeGridDay: {
                                            validRange(nowDate) {
                                                const baseDate =
                                                    startOfDay(nowDate);
                                                return {
                                                    start: addDays(
                                                        baseDate,
                                                        -7,
                                                    ),
                                                    end: addDays(baseDate, 8),
                                                };
                                            },
                                        },
                                        dayGridMonth: {
                                            validRange(nowDate) {
                                                const baseDate =
                                                    startOfDay(nowDate);
                                                return {
                                                    start: baseDate,
                                                    end: addMonths(baseDate, 2),
                                                };
                                            },
                                        },
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {selectedEvent && (
                <div
                    className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
                        modalVisible ? "opacity-100" : "opacity-0"
                    }`}
                    onClick={closeModal}
                >
                    <div
                        className="flex gap-3"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            className={`flex h-[50vh] w-[24vw] max-w-lg flex-col justify-between rounded-md p-6 shadow-lg transition-all duration-300 ${
                                modalVisible
                                    ? "scale-100 opacity-100"
                                    : "scale-95 opacity-0"
                            }`}
                            style={{
                                backgroundColor: selectedEvent.backgroundColor,
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {modalStep === modalSteps.details ? (
                                <div>
                                    <p className="text-sm font-medium text-white/70">
                                        {selectedEvent.kind === "block"
                                            ? "Bloqueio"
                                            : "Consulta"}
                                    </p>
                                    <h2 className="text-lg font-semibold text-white">
                                        {selectedEvent.client}
                                    </h2>
                                    <p className="mt-2 text-sm text-gray-300">
                                        Profissional: {selectedEvent.employee}
                                    </p>
                                    {selectedEvent.blockLabel && (
                                        <p className="mt-2 text-sm text-gray-300">
                                            Rótulo do bloqueio:{" "}
                                            {selectedEvent.blockLabel}
                                        </p>
                                    )}
                                    {selectedEvent.kind ===
                                        "appointment-month-summary" &&
                                        selectedEvent.blockCount > 0 && (
                                            <p className="mt-2 text-sm text-gray-300">
                                                Bloqueios vinculados:{" "}
                                                {selectedEvent.blockLabels.join(
                                                    ", ",
                                                )}
                                            </p>
                                        )}
                                    <p className="mt-2 text-sm text-gray-300">
                                        Início:{" "}
                                        {selectedEvent.start.toLocaleString(
                                            "pt-BR",
                                        )}
                                    </p>
                                    <p className="mt-2 text-sm text-gray-300">
                                        Fim:{" "}
                                        {selectedEvent.end.toLocaleString(
                                            "pt-BR",
                                        )}
                                    </p>
                                    {selectedEvent.kind !== "block" && (
                                        <>
                                            <p className="mt-2 text-sm text-gray-300">
                                                Consulta original:{" "}
                                                {selectedEvent.originalStart.toLocaleString(
                                                    "pt-BR",
                                                )}
                                            </p>
                                            <p className="mt-2 text-sm text-gray-300">
                                                Término original:{" "}
                                                {selectedEvent.originalEnd.toLocaleString(
                                                    "pt-BR",
                                                )}
                                            </p>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <form
                                    className="flex h-full flex-col justify-between"
                                    onSubmit={submitBlockForm}
                                >
                                    <div>
                                        <p className="text-sm font-medium text-white/70">
                                            Novo bloqueio
                                        </p>
                                        <h2 className="text-lg font-semibold text-white">
                                            {selectedEvent.client}
                                        </h2>
                                        <p className="mt-2 text-sm text-gray-300">
                                            Janela disponível:{" "}
                                            {originalAppointmentRange}
                                        </p>
                                        <p className="mt-1 text-sm text-gray-300">
                                            Digite apenas números e o campo será
                                            formatado como hh:mm.
                                        </p>

                                        <div className="mt-6 grid grid-cols-2 gap-4">
                                            <div>
                                                <label
                                                    className="text-sm font-medium text-white"
                                                    htmlFor="block-start-time"
                                                >
                                                    Hora inicial
                                                </label>
                                                <TextInput
                                                    id="block-start-time"
                                                    name="start_time"
                                                    value={data.start_time}
                                                    placeholder="--:--"
                                                    inputMode="numeric"
                                                    autoComplete="off"
                                                    isFocused={
                                                        modalStep ===
                                                        modalSteps.createBlock
                                                    }
                                                    className="mt-2 block w-full bg-white/90 text-gray-900 placeholder:text-gray-400"
                                                    maxLength={5}
                                                    onChange={(e) =>
                                                        handleTimeFieldChange(
                                                            "start_time",
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                <InputError
                                                    message={errors.start_time}
                                                    className="mt-2 text-red-200"
                                                />
                                            </div>

                                            <div>
                                                <label
                                                    className="text-sm font-medium text-white"
                                                    htmlFor="block-finish-time"
                                                >
                                                    Hora final
                                                </label>
                                                <TextInput
                                                    id="block-finish-time"
                                                    name="finish_time"
                                                    value={data.finish_time}
                                                    placeholder="--:--"
                                                    inputMode="numeric"
                                                    autoComplete="off"
                                                    className="mt-2 block w-full bg-white/90 text-gray-900 placeholder:text-gray-400"
                                                    maxLength={5}
                                                    onChange={(e) =>
                                                        handleTimeFieldChange(
                                                            "finish_time",
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                <InputError
                                                    message={errors.finish_time}
                                                    className="mt-2 text-red-200"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            className="cursor-pointer rounded-md bg-white/15 px-4 py-2 text-sm text-white"
                                            onClick={handleBackToDetails}
                                        >
                                            Voltar
                                        </button>
                                        <button
                                            type="submit"
                                            className="cursor-pointer rounded-md bg-gray-900 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
                                            disabled={processing}
                                        >
                                            Salvar bloqueio
                                        </button>
                                    </div>
                                </form>
                            )}

                            {modalStep === modalSteps.details && (
                                <div className="mt-4 flex justify-end">
                                    <button
                                        type="button"
                                        className="cursor-pointer rounded-md bg-gray-900 px-4 py-2 text-sm text-white"
                                        onClick={closeModal}
                                    >
                                        Fechar
                                    </button>
                                </div>
                            )}
                        </div>

                        <div
                            className={`flex flex-col gap-2 transition-all duration-500 ease-out ${
                                showActions
                                    ? "translate-x-0 opacity-100"
                                    : "-translate-x-6 opacity-0"
                            }`}
                        >
                            {modalStep === modalSteps.details &&
                                canCreateBlock && (
                                    <button
                                        type="button"
                                        className="cursor-pointer rounded-md bg-gray-900 px-4 py-2 text-sm text-white"
                                        onClick={openBlockForm}
                                    >
                                        Bloquear Horário
                                    </button>
                                )}

                            {modalStep === modalSteps.createBlock && (
                                <>
                                    <button
                                        type="button"
                                        className="cursor-pointer rounded-md bg-white/15 px-4 py-2 text-sm text-white"
                                        onClick={handleBackToDetails}
                                    >
                                        Voltar
                                    </button>
                                    <button
                                        type="button"
                                        className="cursor-pointer rounded-md bg-gray-900 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
                                        disabled={processing}
                                        onClick={submitBlockForm}
                                    >
                                        Salvar bloqueio
                                    </button>
                                </>
                            )}

                            <button
                                type="button"
                                className="cursor-pointer rounded-md bg-gray-900 px-4 py-2 text-sm text-white"
                                onClick={closeModal}
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
