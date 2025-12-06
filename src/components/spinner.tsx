import { Loader2 } from "lucide-react";

export function Spinner() {
    return(
        <div className="w-full flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
    )

}
