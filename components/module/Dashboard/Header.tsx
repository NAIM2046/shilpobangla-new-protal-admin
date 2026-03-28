import { SidebarTrigger } from "@/components/ui/sidebar";

// 🌟 প্রপস-এর টাইপ ডিফাইন করে নেওয়া হলো
type HeaderProps = {
  name?: string;
  email?: string;
  role?: string;
  avatar?: string;
};

export default function Header({ name, email, role, avatar }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white">
      <SidebarTrigger className="-ml-1" />
      
      <div className="flex flex-1 items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-800">শিল্পবাংলা</h1>
        
        {/* 🌟 ইউজারের প্রোফাইল ইনফরমেশন */}
        <div className="flex items-center gap-3">
          
          {/* নাম এবং রোল (মোবাইলে হাইড থাকবে, বড় স্ক্রিনে দেখাবে) */}
          <div className="hidden md:block text-right">
            <p className="text-sm font-semibold text-slate-900">{name}</p>
            <p className="text-xs text-slate-500">{email}</p>
          </div>

          {/* অ্যাভাটার (ছবি) */}
          {avatar ? (
            <img 
              src={avatar} 
              alt={name || "User Avatar"} 
              className="w-10 h-10 rounded-full object-cover border-2 border-slate-100"
            />
          ) : (
            // ছবি না থাকলে নামের প্রথম অক্ষর দেখাবে
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border-2 border-blue-200">
              {name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          )}
          
        </div>
      </div>
    </header>
  );
}