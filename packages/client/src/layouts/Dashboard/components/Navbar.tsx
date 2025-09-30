import { SignedIn, UserButton } from "@clerk/clerk-react";

export const Navbar = () => {
  // DRAW
  return (
    <div className="w-full h-full py-1 px-2 rounded-sm flex flex-row items-center justify-between">
      <div className="text-lg font-semibold">Forecast</div>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
};
