import { useBackgroundHook } from "@/hooks/useBackground";
import { XCircleIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import Alert from "@/components/ui/Alert";
import Input from "@/components/ui/Input";
import MultiSelect from "@/features/multiselect/MultiSelect";
import Textarea from "@/components/ui/Textarea";

export default function AboutForm() {
    const { details, update, handleImage } = useBackgroundHook();

    return (
        <>
            <Input
                label="Name"
                value={details.fullName}
                placeholder="Mark Kenneth Pelayo"
                onChange={event => update("fullName", event.target.value)}
                isStretch={true}
            />

            <Input
                label="Position (Optional)"
                value={details.jobTitle}
                placeholder="Web Developer"
                onChange={event => update("jobTitle", event.target.value)}
                isStretch={true}
            />

            <MultiSelect
                label="Languages"
                mode="language"
                value={details.knownLanguages}
                placeholder="Tagalog, English"
                onChange={value => update("knownLanguages", value)}
            />

            <Textarea
                label="Summary"
                value={details.summary}
                placeholder="Tell me something about yourself"
                onChange={event => update("summary", event.target.value)}
                isStretch={true}
            />
            
            <Input
                label="Profile picture"
                type="file"
                accept="image"
                onChange={handleImage}
                isStretch={true}
            />
            {details.profilePicture ? (
                <Alert text="You have uploaded your profile picture" icon={<CheckCircleIcon className="size-6" />} variant="success" isSoft={true} />
            ) : (
                <Alert text="You have not yet uploaded your profile picture" icon={<XCircleIcon className="size-6" />} isSoft={true} />
            )}
        </>
    );
}