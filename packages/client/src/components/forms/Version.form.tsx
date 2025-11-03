import { versionFormSlice } from "@/store/forms/versionFormSlice";
import { useAppDispatch, useAppSelector } from "@/utils/hooks/storeHooks";
import { GForm } from "../GForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { versionsAPI } from "@/store/api/versions.api";
import { TextInput } from "@mantine/core";
import { useCallback, useEffect } from "react";
import semver from "semver";

const versionFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  version: z
    .string()
    .min(1, "Version is required")
    .refine((version) => semver.valid(version), {
      message: "Invalid version format",
    }),
});

const defaultValues: z.infer<typeof versionFormSchema> = {
  name: "",
  version: "0.0.1",
};

export const VersionForm = () => {
  // HOOKS
  const { opened, isCreateMode, strategyId, versionId } = useAppSelector(
    (state) => state.versionForm
  );
  const dispatch = useAppDispatch();
  const form = useForm<z.infer<typeof versionFormSchema>>({
    resolver: zodResolver(versionFormSchema),
    defaultValues,
  });
  // API
  const [createVersion, createVersionAPI] =
    versionsAPI.useCreateVersionMutation();
  const [updateVersion, updateVersionAPI] =
    versionsAPI.useUpdateVersionMutation();
  const [getVersion, getVersionAPI] = versionsAPI.useLazyGetVersionQuery();

  // HANDLERS
  const resetFormState = () => {
    dispatch(versionFormSlice.actions.setIsCreateMode(true));
    dispatch(versionFormSlice.actions.setVersionId(""));
    dispatch(versionFormSlice.actions.setStrategyId(""));
    form.reset(defaultValues);
  };
  const handleClose = () => {
    dispatch(versionFormSlice.actions.setOpened(false));
    resetFormState();
  };
  const handleSubmit = () => {
    form.handleSubmit(() => {
      if (!versionId) {
        createVersion({
          body: {
            name: form.getValues().name,
            version: form.getValues().version,
            customAttributes: {},
          },
          params: { strategyid: strategyId },
        });
      } else {
        updateVersion({
          body: {
            name: form.getValues().name,
            version: form.getValues().version,
            customAttributes: {},
          },
          params: { strategyid: strategyId, id: versionId },
        });
      }
      handleClose();
    })();
  };
  const handleGetVersion = useCallback(async () => {
    if (!strategyId || !versionId) return;
    const response = await getVersion({
      strategyid: strategyId,
      id: versionId,
    });
    if (response.data && response.data.data) {
      form.reset({
        name: response.data.data.name,
        version: response.data.data.version,
      });
    }
  }, [form, getVersion, strategyId, versionId]);

  // EFFECTS
  useEffect(() => {
    if (strategyId && versionId) {
      handleGetVersion();
    }
  }, [handleGetVersion, strategyId, versionId]);

  // DRAW
  return (
    <GForm
      opened={opened}
      onClose={handleClose}
      onExitTransitionEnd={resetFormState}
      primaryAction={{
        label: isCreateMode ? "Create Version" : "Save Changes",
        onClick: handleSubmit,
        loading: createVersionAPI.isLoading || updateVersionAPI.isLoading,
      }}
      loading={getVersionAPI.isLoading}
      title={isCreateMode ? "Create a new Version" : "Edit Version"}
    >
      <div className="w-full h-full flex flex-col">
        <TextInput
          label="Name"
          withAsterisk
          placeholder="Enter version name"
          className="w-full"
          error={form.formState.errors.name?.message}
          {...form.register("name")}
        />
        <TextInput
          label="Version"
          withAsterisk
          placeholder="Enter version"
          className="w-full"
          error={form.formState.errors.version?.message}
          {...form.register("version")}
        />
      </div>
    </GForm>
  );
};
