import { useAppDispatch, useAppSelector } from "@/utils/hooks/storeHooks";
import { GForm } from "@/components/GForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { TextInput, MultiSelect } from "@mantine/core";
import { useCallback, useEffect, useState, useMemo } from "react";
import { shortlistsAPI } from "@/store/api/shortlists.api";
import { instrumentsAPI } from "@/store/api/instruments.api";
import { shortlistFormSlice } from "@/store/forms/shortlistFormSlice";
import { useDebouncedValue } from "@mantine/hooks";

const shortlistFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  instruments: z.array(z.string()),
});

const defaultValues: z.infer<typeof shortlistFormSchema> = {
  name: "",
  instruments: [],
};

export const ShortlistForm = () => {
  // HOOKS
  const { opened, isCreateMode, shortlistId } = useAppSelector(
    (state) => state.shortlistForm
  );
  const dispatch = useAppDispatch();
  const form = useForm<z.infer<typeof shortlistFormSchema>>({
    resolver: zodResolver(shortlistFormSchema),
    defaultValues,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 300);

  // API
  const [createShortlist, createShortlistAPI] =
    shortlistsAPI.useCreateShortlistMutation();
  const [updateShortlist, updateShortlistAPI] =
    shortlistsAPI.useUpdateShortlistMutation();
  const [getShortlist, getShortlistAPI] =
    shortlistsAPI.useLazyGetShortlistQuery();
  const [getInstruments, getInstrumentsAPI] =
    instrumentsAPI.useLazyGetInstrumentsQuery();

  // VARIABLES
  const instrumentOptions = useMemo(() => {
    if (!getInstrumentsAPI.data?.data?.instruments) return [];
    return getInstrumentsAPI.data.data.instruments.map((instrument) => ({
      value: instrument.id,
      label: `${instrument.name} (${instrument.symbol} - ${instrument.exchange})`,
    }));
  }, [getInstrumentsAPI.data]);

  // HANDLERS
  const resetFormState = () => {
    dispatch(shortlistFormSlice.actions.setIsCreateMode(true));
    dispatch(shortlistFormSlice.actions.setShortlistId(""));
    form.reset(defaultValues);
  };
  const handleClose = () => {
    dispatch(shortlistFormSlice.actions.setOpened(false));
    resetFormState();
  };
  const handleSubmit = () => {
    form.handleSubmit(async () => {
      if (!shortlistId) {
        await createShortlist({
          name: form.getValues().name,
          instruments: form.getValues().instruments,
        });
      } else {
        await updateShortlist({
          params: { id: shortlistId },
          body: {
            name: form.getValues().name,
            instruments: form.getValues().instruments,
          },
        });
      }
      handleClose();
    })();
  };
  const handleGetShortlist = useCallback(async () => {
    if (!shortlistId) return;
    const response = await getShortlist({
      id: shortlistId,
    });
    if (response.data && response.data.data) {
      form.reset({
        name: response.data.data.name,
        instruments: response.data.data.instruments.map((i) => i.id),
      });
    }
  }, [form, getShortlist, shortlistId]);

  // EFFECTS
  useEffect(() => {
    if (shortlistId && opened) {
      handleGetShortlist();
    }
  }, [handleGetShortlist, shortlistId, opened]);
  useEffect(() => {
    getInstruments({
      query: debouncedSearchQuery,
    });
  }, [debouncedSearchQuery, getInstruments]);

  // DRAW
  return (
    <GForm
      opened={opened}
      onClose={handleClose}
      onExitTransitionEnd={resetFormState}
      primaryAction={{
        label: isCreateMode ? "Create Shortlist" : "Save Changes",
        onClick: handleSubmit,
        loading: createShortlistAPI.isLoading || updateShortlistAPI.isLoading,
      }}
      loading={getShortlistAPI.isLoading}
      title={isCreateMode ? "Create a new Shortlist" : "Edit Shortlist"}
    >
      <div className="w-full h-full flex flex-col gap-4">
        <TextInput
          label="Name"
          withAsterisk
          placeholder="Enter shortlist name"
          className="w-full"
          error={form.formState.errors.name?.message}
          {...form.register("name")}
        />
        <Controller
          name="instruments"
          control={form.control}
          render={({ field }) => (
            <MultiSelect
              {...field}
              label="Instruments"
              withAsterisk
              placeholder="Search instruments..."
              searchable
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              data={instrumentOptions}
              nothingFoundMessage={
                getInstrumentsAPI.isLoading || getInstrumentsAPI.isFetching
                  ? "Searching..."
                  : instrumentOptions.length === 0
                  ? "No instruments found"
                  : searchQuery
                  ? "Waiting to start searching..."
                  : "Type to search instruments"
              }
              clearable
              checkIconPosition="right"
              maxDropdownHeight={300}
              className="w-full"
              error={form.formState.errors.instruments?.message}
            />
          )}
        />
      </div>
    </GForm>
  );
};
