import { strategiesApi } from "@/store/api/strategies.api";
import { strategyFormSlice } from "@/store/forms/strategyFormSlice";
import { useAppDispatch, useAppSelector } from "@/utils/hooks/storeHooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea, TextInput } from "@mantine/core";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { GForm } from "../GForm";
import { notifications } from "@mantine/notifications";
import { useCallback, useEffect } from "react";

const strategyFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
});

const defaultValues: z.infer<typeof strategyFormSchema> = {
  name: "",
  description: "",
};

export const StrategyForm = () => {
  // HOOKS
  const { opened, isCreateMode, strategyId } = useAppSelector(
    (state) => state.strategyForm
  );
  const [createStrategy, createStrategyAPI] =
    strategiesApi.useCreateStrategyMutation();
  const [updateStrategy, updateStrategyAPI] =
    strategiesApi.useUpdateStrategyMutation();
  const [getStrategy, getStrategyAPI] = strategiesApi.useLazyGetStrategyQuery();
  const form = useForm<z.infer<typeof strategyFormSchema>>({
    resolver: zodResolver(strategyFormSchema),
    defaultValues,
  });
  const dispatch = useAppDispatch();

  // HANDLERS
  const resetFormState = () => {
    dispatch(strategyFormSlice.actions.setIsCreateMode(true));
    dispatch(strategyFormSlice.actions.setStrategyId(null));
    form.reset(defaultValues);
  };
  const handleClose = () => {
    dispatch(strategyFormSlice.actions.setOpened(false));
    resetFormState();
  };
  const handleSubmit = async () => {
    if (!strategyId) {
      await form.handleSubmit(async (data) => {
        const response = await createStrategy({
          name: data.name,
          description: data.description,
          isPublic: false,
          customAttributes: {},
        });
        if (response.data) {
          handleClose();
          notifications.show({
            title: "Success",
            message: response.data.message,
            color: "green",
          });
        }
      })();
    } else {
      await form.handleSubmit(async (data) => {
        const response = await updateStrategy({
          params: { id: strategyId },
          body: { name: data.name, description: data.description },
        });
        if (response.data) {
          handleClose();
          notifications.show({
            title: "Success",
            message: response.data.message,
            color: "green",
          });
        }
      })();
    }
  };
  const handleGetStrategy = useCallback(async () => {
    if (!strategyId) return;
    const response = await getStrategy({ id: strategyId });
    if (response.data && response.data.data) {
      form.reset({
        name: response.data.data.name,
        description: response.data.data.description,
      });
    }
  }, [form, getStrategy, strategyId]);

  useEffect(() => {
    if (strategyId) {
      handleGetStrategy();
    }
  }, [handleGetStrategy, strategyId]);

  // DRAW
  return (
    <GForm
      opened={opened}
      onClose={handleClose}
      onExitTransitionEnd={resetFormState}
      primaryAction={{
        label: isCreateMode ? "Create Strategy" : "Save Changes",
        onClick: handleSubmit,
        loading: createStrategyAPI.isLoading || updateStrategyAPI.isLoading,
      }}
      loading={getStrategyAPI.isLoading}
      title={isCreateMode ? "Create a new Strategy" : "Edit Strategy"}
    >
      <div className="w-full h-full flex flex-col">
        <TextInput
          label="Name"
          withAsterisk
          placeholder="Enter strategy name"
          className="w-full"
          error={form.formState.errors.name?.message}
          {...form.register("name")}
        />
        <Textarea
          label="Description"
          placeholder="Enter strategy description"
          error={form.formState.errors.description?.message}
          {...form.register("description")}
        />
      </div>
    </GForm>
  );
};
