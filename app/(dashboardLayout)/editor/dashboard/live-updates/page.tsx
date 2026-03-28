import LiveUpdateList from "@/components/module/live-updates/LiveUpdateList";
import { getAllLiveUpdate } from "@/services/live-update/live-update.service";



export const dynamic = "force-dynamic";

export default async function LiveUpdatePage() {
  let updates : any = [];

  
     const result = await getAllLiveUpdate();
    
   
    
    
    
    if (result.success) {
      updates = result.data;
    }
    else{
        console.log(`${result.message}`)
    }
 

  // 🌟 ডাটাগুলো Client Component-এ পাঠিয়ে দিচ্ছি
  return <LiveUpdateList initialUpdates={updates} />;
}