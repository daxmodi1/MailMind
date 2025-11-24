import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function NavAuthButton() {
  // Check session on server side - instant, no lag
  const session = await getServerSession(authOptions);
  const isAuthenticated = !!session;

  return (
    <div className="bg-gradient-to-b from-stone-300/40 to-transparent p-[4px] rounded-[16px]">
      <Link href={isAuthenticated ? "/dashboard" : "/login"} className="block">
        <button className="group p-[4px] rounded-[12px] bg-gradient-to-b from-white to-stone-200/40 shadow-[0_1px_3px_rgba(0,0,0,0.5)] active:shadow-[0_0px_1px_rgba(0,0,0,0.5)] active:scale-[0.995]">
          <div className="bg-gradient-to-b from-stone-200/40 to-white/80 rounded-[8px] px-2 py-0.5">
            <div className="flex gap-2 items-center">
              <span className="font-semibold">{isAuthenticated ? 'Dashboard' : 'Get Started'}</span>
            </div>
          </div>
        </button>
      </Link>
    </div>
  );
}
