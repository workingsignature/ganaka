import { versionFormSlice } from "@/store/forms/versionFormSlice";
import { useAppDispatch, useAppSelector } from "@/utils/hooks/storeHooks";
import { Drawer } from "@mantine/core";

export const VersionForm = () => {
  // HOOKS
  const { opened, isCreateMode } = useAppSelector((state) => state.versionForm);
  const dispatch = useAppDispatch();

  // HANDLERS
  const resetFormState = () => {
    dispatch(versionFormSlice.actions.setIsCreateMode(true));
  };
  const handleClose = () => {
    dispatch(versionFormSlice.actions.setOpened(false));
    resetFormState();
  };

  // DRAW
  return (
    <Drawer
      opened={opened}
      onClose={handleClose}
      onExitTransitionEnd={resetFormState}
      position="right"
      title={isCreateMode ? "Create Version" : "Edit Version"}
    >
      Version Form
    </Drawer>
  );
};
