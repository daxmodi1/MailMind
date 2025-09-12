import CustomButton from "./custom-btn";
import FloatingIconsDemo from "./float-icons";

export default function Features2() {
  return (
    <div className="flex flex-col items-center relative z-20 pt-16 px-4 md:px-8 lg:px-16 gap-10">
      <div className="flex flex-col md:flex-row w-full max-w-6xl items-center justify-between gap-10">

        <div className="text-3xl md:text-5xl text-primary font-semibold text-center md:text-left">
          <div>Seamless Integration</div>
          <div>for a Smarter Workflow</div>
        </div>

        <div className="text-center md:text-left">
          <div className="text-lg md:text-xl text-muted-foreground mb-5">
            <div>Connect MailMind with your favorite tools</div>
            <div>and boost productivity effortlessly</div>
          </div>
          <CustomButton>Explore Integrations</CustomButton>
        </div>
      </div>
      <FloatingIconsDemo />
    </div>
  );
}
