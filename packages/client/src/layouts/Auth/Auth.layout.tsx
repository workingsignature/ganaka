import { SignedOut, SignIn } from "@clerk/clerk-react";

export const Auth = () => {
  // DRAW
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <SignedOut>
        <SignIn withSignUp />
      </SignedOut>
    </div>
  );
};
