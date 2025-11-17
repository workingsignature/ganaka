import { GForm } from "@/components/GForm";
import { icons } from "@/components/icons";
import { runsAPI } from "@/store/api/runs.api";
import { shortlistsAPI } from "@/store/api/shortlists.api";
import { runFormSlice } from "@/store/forms/runFormSlice";
import { useAppDispatch, useAppSelector } from "@/utils/hooks/storeHooks";
import type { v1_core_strategies_versions_runs_schemas } from "@ganaka/server-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { ToWords } from "to-words";
import {
  ActionIcon,
  Button,
  Divider,
  Fieldset,
  MultiSelect,
  NumberInput,
  SegmentedControl,
  Select,
  Text,
  Tooltip,
} from "@mantine/core";
import { DateTimePicker, getTimeRange, TimePicker } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { capitalize } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from "react-hook-form";
import { z } from "zod";

// Form schema matching the API input schema
const timeslotSchema = z.object({
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  interval: z.number().min(1, "Interval must be at least 1"),
});

const daywiseScheduleSchema = z.object({
  timeslots: z
    .array(timeslotSchema)
    .min(1, "At least one timeslot is required"),
  shortlist: z.array(z.string()).min(1, "At least one shortlist is required"),
});

const runFormSchema = z.object({
  runType: z.enum(["BACKTEST", "LIVE"]),
  status: z
    .enum(["PENDING", "RUNNING", "COMPLETED", "FAILED", "CANCELLED"])
    .optional(),
  startingBalance: z.number().min(0, "Starting balance must be >= 0"),
  schedule: z.object({
    startDateTime: z.string().min(1, "Start date/time is required"),
    endDateTime: z.string().min(1, "End date/time is required"),
    daywise: z.object({
      monday: daywiseScheduleSchema,
      tuesday: daywiseScheduleSchema,
      wednesday: daywiseScheduleSchema,
      thursday: daywiseScheduleSchema,
      friday: daywiseScheduleSchema,
    }),
  }),
  errorLog: z.string().optional(),
});

type RunFormData = z.infer<typeof runFormSchema>;

const defaultDaywiseSchedule: z.infer<typeof daywiseScheduleSchema> = {
  timeslots: [
    {
      startTime: "",
      endTime: "",
      interval: 5,
    },
  ],
  shortlist: [],
};

const defaultValues: RunFormData = {
  runType: "BACKTEST",
  startingBalance: 0,
  schedule: {
    startDateTime: "",
    endDateTime: "",
    daywise: {
      monday: defaultDaywiseSchedule,
      tuesday: defaultDaywiseSchedule,
      wednesday: defaultDaywiseSchedule,
      thursday: defaultDaywiseSchedule,
      friday: defaultDaywiseSchedule,
    },
  },
};

const DAYS = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
] as const;

type DayKey = (typeof DAYS)[number]["key"];

const TIME_RANGE = getTimeRange({
  startTime: "09:00:00",
  endTime: "15:30:00",
  interval: "00:15:00",
});

// Render daywise schedule section for selected day
const DaywiseSchedule = ({ selectedDay }: { selectedDay: DayKey }) => {
  // HOOKS
  const form = useFormContext<RunFormData>();

  // API
  const getShortlistsAPI = shortlistsAPI.useGetShortlistsQuery();

  // VARIABLES
  const shortlistOptions = useMemo(() => {
    if (!getShortlistsAPI.data?.data) return [];
    return getShortlistsAPI.data.data.map((shortlist) => ({
      value: shortlist.id,
      label: shortlist.name,
    }));
  }, [getShortlistsAPI.data]);
  const dayPath = `schedule.daywise.${selectedDay}` as const;
  // Daywise schedule field arrays
  const mondayTimeslots = useFieldArray({
    control: form.control,
    name: "schedule.daywise.monday.timeslots",
  });
  const tuesdayTimeslots = useFieldArray({
    control: form.control,
    name: "schedule.daywise.tuesday.timeslots",
  });
  const wednesdayTimeslots = useFieldArray({
    control: form.control,
    name: "schedule.daywise.wednesday.timeslots",
  });
  const thursdayTimeslots = useFieldArray({
    control: form.control,
    name: "schedule.daywise.thursday.timeslots",
  });
  const fridayTimeslots = useFieldArray({
    control: form.control,
    name: "schedule.daywise.friday.timeslots",
  });

  // HANDLERS
  const getTimeslotsArray = (day: DayKey) => {
    switch (day) {
      case "monday":
        return mondayTimeslots;
      case "tuesday":
        return tuesdayTimeslots;
      case "wednesday":
        return wednesdayTimeslots;
      case "thursday":
        return thursdayTimeslots;
      case "friday":
        return fridayTimeslots;
    }
  };
  const handleApplyToAllDays = () => {
    const currentDayData = form.getValues(`schedule.daywise.${selectedDay}`);
    const otherDays = DAYS.filter((day) => day.key !== selectedDay);

    otherDays.forEach((day) => {
      const dayTimeslots = getTimeslotsArray(day.key);
      // Copy timeslots using field array replace
      dayTimeslots.replace(
        JSON.parse(JSON.stringify(currentDayData.timeslots))
      );
      // Copy shortlist
      form.setValue(`schedule.daywise.${day.key}.shortlist`, [
        ...currentDayData.shortlist,
      ]);
    });

    notifications.show({
      title: "Success",
      message: `Applied ${capitalize(selectedDay)}'s values to all other days`,
      color: "green",
    });
  };

  // VARIABLES
  const timeslots = getTimeslotsArray(selectedDay);

  // DRAW
  return (
    <div className="flex flex-col gap-4">
      {/* Timeslots */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <Text size="sm" fw={500}>
            Execution Windows
          </Text>
          <Tooltip label="Copy execution scheudle to other days">
            <ActionIcon
              variant="subtle"
              size="xs"
              onClick={handleApplyToAllDays}
            >
              <Icon icon={icons.copy} />
            </ActionIcon>
          </Tooltip>
        </div>
        {timeslots.fields.map((field, index) => (
          <Fieldset key={field.id} className="flex items-start gap-2 relative">
            <div className="flex-1 grid grid-cols-3 gap-2 w-full">
              <Controller
                key={`${selectedDay}-timeslot-${index}-startTime`}
                name={`${dayPath}.timeslots.${index}.startTime` as const}
                control={form.control}
                render={({ field, fieldState }) => (
                  <TimePicker
                    label="Start Time"
                    withDropdown
                    description="Execution start time"
                    presets={TIME_RANGE}
                    format="12h"
                    onChange={(value: string | null) =>
                      field.onChange(value || "")
                    }
                    value={field.value}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                key={`${selectedDay}-timeslot-${index}-endTime`}
                name={`${dayPath}.timeslots.${index}.endTime` as const}
                control={form.control}
                render={({ field, fieldState }) => (
                  <TimePicker
                    label="End Time"
                    withDropdown
                    description="Execution stop time"
                    format="12h"
                    presets={TIME_RANGE}
                    value={field.value}
                    onChange={(value: string | null) =>
                      field.onChange(value || "")
                    }
                    error={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                key={`${selectedDay}-timeslot-${index}-interval`}
                name={`${dayPath}.timeslots.${index}.interval` as const}
                control={form.control}
                render={({ field, fieldState }) => (
                  <NumberInput
                    label="Execution Interval"
                    placeholder="Execution interval"
                    description={`Execution every ${field.value} minutes`}
                    min={1}
                    max={360}
                    clampBehavior="strict"
                    value={field.value}
                    onChange={(value) => field.onChange(Number(value) || 0)}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </div>
            {timeslots.fields.length > 1 && (
              <Tooltip label="Remove timeslot">
                <ActionIcon
                  color="red"
                  variant="subtle"
                  onClick={() => timeslots.remove(index)}
                  className="!absolute top-0 right-0"
                >
                  <Icon icon={icons.delete} />
                </ActionIcon>
              </Tooltip>
            )}
          </Fieldset>
        ))}
        <Button
          variant="light"
          size="xs"
          leftSection={<Icon icon={icons.create} />}
          onClick={() =>
            timeslots.append({
              startTime: "",
              endTime: "",
              interval: 5,
            })
          }
        >
          Add Timeslot
        </Button>
      </div>

      {/* Shortlist */}
      <Controller
        key={`${selectedDay}-shortlist`}
        name={`${dayPath}.shortlist` as const}
        control={form.control}
        render={({ field, fieldState }) => (
          <MultiSelect
            label={`Shortlists for ${capitalize(selectedDay)}`}
            placeholder="Select shortlists"
            data={shortlistOptions}
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />
    </div>
  );
};

export const RunForm = () => {
  // HOOKS
  const { opened, isCreateMode, strategyId, versionId, runId } = useAppSelector(
    (state) => state.runForm
  );
  const dispatch = useAppDispatch();
  const [selectedDay, setSelectedDay] = useState<DayKey>("monday");

  const form = useForm<RunFormData>({
    resolver: zodResolver(runFormSchema),
    defaultValues,
  });

  // API
  const [createRun, createRunAPI] = runsAPI.useCreateRunMutation();
  const [updateRun, updateRunAPI] = runsAPI.useUpdateRunMutation();
  const [getRun, getRunAPI] = runsAPI.useLazyGetRunQuery();

  // VARIABLES
  const toWords = new ToWords({
    localeCode: "en-IN",
    converterOptions: {
      currency: true,
      ignoreDecimal: false,
      ignoreZeroCurrency: false,
      doNotAddOnly: false,
      currencyOptions: {
        name: "Rupee",
        plural: "Rupees",
        symbol: "₹",
        fractionalUnit: {
          name: "Paisa",
          plural: "Paise",
          symbol: "",
        },
      },
    },
  });

  // HANDLERS
  const resetFormState = () => {
    dispatch(runFormSlice.actions.setIsCreateMode(true));
    dispatch(runFormSlice.actions.setRunId(""));
    form.reset(defaultValues);
  };

  const handleClose = () => {
    dispatch(runFormSlice.actions.setOpened(false));
    resetFormState();
  };

  const handleSubmit = async () => {
    await form.handleSubmit(async (data) => {
      if (!strategyId || !versionId) {
        notifications.show({
          title: "Error",
          message: "Strategy and version must be selected",
          color: "red",
        });
        return;
      }

      if (isCreateMode) {
        const body: z.infer<
          typeof v1_core_strategies_versions_runs_schemas.createRun.body
        > = {
          runType: data.runType,
          schedule: data.schedule,
          startingBalance: data.startingBalance,
          customAttributes: {},
          status: "PENDING",
        };
        const response = await createRun({
          body,
          params: {
            strategyid: strategyId,
            versionid: versionId,
          },
        });
        if (response.data) {
          notifications.show({
            title: "Success",
            message: response.data.message,
            color: "green",
          });
          handleClose();
        }
      } else if (runId) {
        const updateBody: z.infer<
          typeof v1_core_strategies_versions_runs_schemas.updateRun.body
        > = {
          runType: data.runType,
          schedule: data.schedule,
          startingBalance: data.startingBalance,
          errorLog: data.errorLog || null,
          ...(data.status ? { status: data.status } : {}),
        };

        const response = await updateRun({
          body: updateBody,
          params: {
            strategyid: strategyId,
            versionid: versionId,
            id: runId,
          },
        });
        if (response.data) {
          notifications.show({
            title: "Success",
            message: response.data.message,
            color: "green",
          });
          handleClose();
        }
      }
    })();
  };

  const handleGetRun = useCallback(async () => {
    if (!strategyId || !versionId || !runId) return;
    const response = await getRun({
      strategyid: strategyId,
      versionid: versionId,
      id: runId,
    });
    if (response.data && response.data.data) {
      const run = response.data.data;
      // Convert output schema to input schema (shortlist objects to IDs)
      form.reset({
        runType: run.runType,
        status: run.status,
        startingBalance: run.startingBalance,
        schedule: {
          startDateTime: run.schedule.startDateTime,
          endDateTime: run.schedule.endDateTime,
          daywise: {
            monday: {
              timeslots: run.schedule.daywise.monday.timeslots.map((ts) => ({
                startTime: ts.startTime,
                endTime: ts.endTime,
                interval: ts.interval,
              })),
              shortlist: run.schedule.daywise.monday.shortlist.map((s) => s.id),
            },
            tuesday: {
              timeslots: run.schedule.daywise.tuesday.timeslots.map((ts) => ({
                startTime: ts.startTime,
                endTime: ts.endTime,
                interval: ts.interval,
              })),
              shortlist: run.schedule.daywise.tuesday.shortlist.map(
                (s) => s.id
              ),
            },
            wednesday: {
              timeslots: run.schedule.daywise.wednesday.timeslots.map((ts) => ({
                startTime: ts.startTime,
                endTime: ts.endTime,
                interval: ts.interval,
              })),
              shortlist: run.schedule.daywise.wednesday.shortlist.map(
                (s) => s.id
              ),
            },
            thursday: {
              timeslots: run.schedule.daywise.thursday.timeslots.map((ts) => ({
                startTime: ts.startTime,
                endTime: ts.endTime,
                interval: ts.interval,
              })),
              shortlist: run.schedule.daywise.thursday.shortlist.map(
                (s) => s.id
              ),
            },
            friday: {
              timeslots: run.schedule.daywise.friday.timeslots.map((ts) => ({
                startTime: ts.startTime,
                endTime: ts.endTime,
                interval: ts.interval,
              })),
              shortlist: run.schedule.daywise.friday.shortlist.map((s) => s.id),
            },
          },
        },
        errorLog: run.errorLog || "",
      });
    }
  }, [form, getRun, strategyId, versionId, runId]);

  // EFFECTS
  useEffect(() => {
    if (strategyId && versionId && runId && opened && !isCreateMode) {
      handleGetRun();
    }
  }, [handleGetRun, strategyId, versionId, runId, opened, isCreateMode]);

  // DRAW
  return (
    <GForm
      opened={opened}
      onClose={handleClose}
      size="xl"
      onExitTransitionEnd={resetFormState}
      primaryAction={{
        label: isCreateMode ? "Create Run" : "Save Changes",
        onClick: handleSubmit,
        loading: createRunAPI.isLoading || updateRunAPI.isLoading,
      }}
      loading={getRunAPI.isLoading}
      title={isCreateMode ? "Schedule a new Run" : "Edit Run"}
    >
      <div className="w-full h-full flex flex-col gap-4 overflow-y-auto">
        {/* Run Type */}
        <Controller
          name="runType"
          control={form.control}
          render={({ field, fieldState }) => (
            <Select
              label="Run Type"
              withAsterisk
              data={[
                { value: "BACKTEST", label: "Backtest" },
                { value: "LIVE", label: "Live" },
              ]}
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />

        {/* Starting Balance */}
        <Controller
          name="startingBalance"
          control={form.control}
          render={({ field, fieldState }) => (
            <NumberInput
              label="Initial Balance"
              thousandSeparator=","
              thousandsGroupStyle="lakh"
              description={
                field.value === 0
                  ? "Initial balance for the entire run"
                  : toWords.convert(field.value)
              }
              withAsterisk
              placeholder="0"
              min={0}
              max={1000000000}
              clampBehavior="strict"
              prefix="₹"
              suffix="/-"
              value={field.value}
              onChange={(value) => field.onChange(Number(value) || 0)}
              error={fieldState.error?.message}
            />
          )}
        />

        {/* Status (only for edit mode) */}
        {!isCreateMode && (
          <Controller
            key="status-edit-mode"
            name="status"
            control={form.control}
            render={({ field, fieldState }) => (
              <Select
                label="Status"
                data={[
                  { value: "PENDING", label: "Pending" },
                  { value: "RUNNING", label: "Running" },
                  { value: "COMPLETED", label: "Completed" },
                  { value: "FAILED", label: "Failed" },
                  { value: "CANCELLED", label: "Cancelled" },
                ]}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        )}

        {/* Schedule Start/End DateTime */}
        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="schedule.startDateTime"
            control={form.control}
            render={({ field, fieldState }) => (
              <DateTimePicker
                label="Schedule Start"
                description="The run will start at this date & time"
                withAsterisk
                placeholder="Select start date & time"
                timePickerProps={{
                  presets: TIME_RANGE,
                  withDropdown: true,
                  format: "12h",
                }}
                value={
                  field.value && field.value !== ""
                    ? new Date(field.value)
                    : null
                }
                onChange={(value: string | null) => field.onChange(value || "")}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="schedule.endDateTime"
            control={form.control}
            render={({ field, fieldState }) => (
              <DateTimePicker
                label="Schedule End"
                withAsterisk
                description="The run will be complete at this date & time"
                placeholder="Select end date & time"
                timePickerProps={{
                  presets: TIME_RANGE,
                  withDropdown: true,
                  format: "12h",
                }}
                value={
                  field.value && field.value !== ""
                    ? new Date(field.value)
                    : null
                }
                onChange={(value: string | null) => field.onChange(value || "")}
                error={fieldState.error?.message}
              />
            )}
          />
        </div>

        <Divider />

        {/* Daywise Schedule */}
        <Fieldset
          legend={
            <Text size="lg" fw={500}>
              Daywise Schedule
            </Text>
          }
        >
          <div className="flex flex-col gap-4">
            <SegmentedControl
              value={selectedDay}
              onChange={(value) => setSelectedDay(value as DayKey)}
              data={DAYS.map((day) => ({
                value: day.key,
                label: day.label,
              }))}
              radius="xl"
              fullWidth
            />
            <FormProvider {...form}>
              <DaywiseSchedule selectedDay={selectedDay} />
            </FormProvider>
          </div>
        </Fieldset>
      </div>
    </GForm>
  );
};
