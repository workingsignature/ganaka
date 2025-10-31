import { strategyFormSlice } from "@/store/forms/strategyFormSlice";
import { useAppDispatch, useAppSelector } from "@/utils/hooks/storeHooks";
import { Drawer } from "@mantine/core";

export const StrategyForm = () => {
  // HOOKS
  const { opened, isCreateMode } = useAppSelector(
    (state) => state.strategyForm
  );
  const dispatch = useAppDispatch();

  // HANDLERS
  const resetFormState = () => {
    dispatch(strategyFormSlice.actions.setIsCreateMode(true));
  };
  const handleClose = () => {
    dispatch(strategyFormSlice.actions.setOpened(false));
    resetFormState();
  };

  // DRAW
  return (
    <Drawer
      opened={opened}
      onClose={handleClose}
      onExitTransitionEnd={resetFormState}
      position="right"
      title={isCreateMode ? "Create Strategy" : "Edit Strategy"}
    >
      Strategy Form
    </Drawer>
  );
};
