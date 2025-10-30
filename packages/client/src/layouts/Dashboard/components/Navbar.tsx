import { SignedIn, UserButton } from "@clerk/clerk-react";
import { Text } from "@mantine/core";

export const Navbar = () => {
  // DRAW
  return (
    <div className="w-full h-full rounded-sm flex flex-row items-center justify-between gap-8">
      <div>
        <Text>Ganaka</Text>
      </div>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
};
