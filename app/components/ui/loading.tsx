import LoadingIcon from "@/app/icons/three-dots.svg";

export function LoadingThreeDot() {
  return (
    <div className="text-primary">
      <LoadingIcon />
    </div>
  );
}

export function LoadingModule() {
  return (
    <div className="w-full h-screen max-h-full flex items-center justify-center">
      <LoadingThreeDot />
    </div>
  );
}
