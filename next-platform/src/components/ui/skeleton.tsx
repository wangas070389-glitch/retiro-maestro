import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={twMerge("animate-pulse rounded-md bg-slate-200", className)}
            {...props}
        />
    )
}

export { Skeleton }
