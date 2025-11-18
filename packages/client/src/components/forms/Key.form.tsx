import { keysApi } from "@/store/api/keys.api";
import { keyFormSlice } from "@/store/forms/keyFormSlice";
import { useAppDispatch, useAppSelector } from "@/utils/hooks/storeHooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea, TextInput } from "@mantine/core";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { GForm } from "../GForm";
import { notifications } from "@mantine/notifications";
import { v1_core_keys_schemas } from "@ganaka/server-schemas";
import type { z as zodType } from "zod";

const keyFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
});

const defaultValues: z.infer<typeof keyFormSchema> = {
  name: "",
  description: "",
};

export const KeyForm = () => {
  // HOOKS
  const { opened } = useAppSelector((state) => state.keyForm);
  const [createKey, createKeyAPI] = keysApi.useCreateKeyMutation();
  const form = useForm<z.infer<typeof keyFormSchema>>({
    resolver: zodResolver(keyFormSchema),
    defaultValues,
  });
  const dispatch = useAppDispatch();

  // HANDLERS
  const resetFormState = () => {
    dispatch(keyFormSlice.actions.setIsCreateMode(true));
    dispatch(keyFormSlice.actions.setKeyId(null));
    form.reset(defaultValues);
  };
  const handleClose = () => {
    dispatch(keyFormSlice.actions.setOpened(false));
    resetFormState();
  };
  const handleSubmit = async () => {
    await form.handleSubmit(async (data) => {
      const response = await createKey({
        name: data.name,
        description: data.description,
      } as unknown as zodType.infer<typeof v1_core_keys_schemas.createKey.body>);
      if (response.data) {
        handleClose();
        notifications.show({
          title: "Success",
          message: response.data.message,
          color: "green",
        });
      }
    })();
  };

  // DRAW
  return (
    <GForm
      opened={opened}
      onClose={handleClose}
      onExitTransitionEnd={resetFormState}
      primaryAction={{
        label: "Create Key",
        onClick: handleSubmit,
        loading: createKeyAPI.isLoading,
      }}
      title="Create a new Developer Key"
    >
      <div className="w-full h-full flex flex-col gap-4">
        <TextInput
          label="Name"
          withAsterisk
          placeholder="Enter key name"
          className="w-full"
          error={form.formState.errors.name?.message}
          {...form.register("name")}
        />
        <Textarea
          label="Description"
          placeholder="Enter key description"
          error={form.formState.errors.description?.message}
          {...form.register("description")}
        />
      </div>
    </GForm>
  );
};
