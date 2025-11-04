import { useAppDispatch, useAppSelector } from "@/utils/hooks/storeHooks";
import { GForm } from "@/components/GForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { TextInput } from "@mantine/core";
import { useCallback, useEffect } from "react";
import { shortlistsAPI } from "@/store/api/shortlists.api";
import { shortlistFormSlice } from "@/store/forms/shortlistFormSlice";

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
  // API
  const [createShortlist, createShortlistAPI] =
    shortlistsAPI.useCreateShortlistMutation();
  const [updateShortlist, updateShortlistAPI] =
    shortlistsAPI.useUpdateShortlistMutation();
  const [getShortlist, getShortlistAPI] =
    shortlistsAPI.useLazyGetShortlistQuery();

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
    form.handleSubmit(() => {
      if (!shortlistId) {
        createShortlist({
          name: form.getValues().name,
          instruments: form.getValues().instruments,
        });
      } else {
        updateShortlist({
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
    if (shortlistId) {
      handleGetShortlist();
    }
  }, [handleGetShortlist, shortlistId]);

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
      <div className="w-full h-full flex flex-col">
        <TextInput
          label="Name"
          withAsterisk
          placeholder="Enter shortlist name"
          className="w-full"
          error={form.formState.errors.name?.message}
          {...form.register("name")}
        />
      </div>
    </GForm>
  );
};
