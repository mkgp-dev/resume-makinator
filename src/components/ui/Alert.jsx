import clsx from "clsx";

export default function Alert({
    text,
    icon,
    variant,
    isSoft = false,
}) {
    const styles = {
        info: "alert-info",
        success: "alert-success",
        warning: "alert-warning",
        error: "alert-error",
    };

    return (
        <div
            role="alert"
            className={clsx(
                "alert rounded-md animate-fade-in",
                styles[variant],
                isSoft && "alert-soft",
            )}
        >
            {icon}
            <span>{text}</span>
        </div>
    );
}