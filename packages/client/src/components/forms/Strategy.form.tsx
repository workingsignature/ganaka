import { strategyFormSlice } from "@/store/forms/strategyFormSlice";
import { useAppDispatch, useAppSelector } from "@/utils/hooks/storeHooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea, TextInput } from "@mantine/core";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { GForm } from "./GForm";

const strategyFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
});

export const StrategyForm = () => {
  // HOOKS
  const { opened, isCreateMode } = useAppSelector(
    (state) => state.strategyForm
  );
  const form = useForm<z.infer<typeof strategyFormSchema>>({
    resolver: zodResolver(strategyFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });
  const dispatch = useAppDispatch();

  // HANDLERS
  const resetFormState = () => {
    dispatch(strategyFormSlice.actions.setIsCreateMode(true));
    form.reset();
  };
  const handleClose = () => {
    dispatch(strategyFormSlice.actions.setOpened(false));
    resetFormState();
  };
  const handleSubmit = () => {
    form.handleSubmit((data) => {
      console.log(data);
    })();
  };

  // DRAW
  return (
    <GForm
      opened={opened}
      onClose={handleClose}
      onExitTransitionEnd={resetFormState}
      primaryAction={{
        label: isCreateMode ? "Create Strategy" : "Save Strategy",
        onClick: handleSubmit,
      }}
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
