import { runFormSlice } from "@/store/forms/runFormSlice";
import { useAppDispatch, useAppSelector } from "@/utils/hooks/storeHooks";
import { Drawer } from "@mantine/core";

export const RunForm = () => {
  // HOOKS
  const { opened, isCreateMode } = useAppSelector((state) => state.runForm);
  const dispatch = useAppDispatch();

  // HANDLERS
  const resetFormState = () => {
    dispatch(runFormSlice.actions.setIsCreateMode(true));
  };
  const handleClose = () => {
    dispatch(runFormSlice.actions.setOpened(false));
    resetFormState();
  };

  // DRAW
  return (
    <Drawer
      opened={opened}
      onClose={handleClose}
      onExitTransitionEnd={resetFormState}
      title={isCreateMode ? "Schedule Run" : "Edit Run"}
      position="right"
    >
      Run Form
    </Drawer>
  );
};
