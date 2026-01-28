import { useBackgroundHook } from "@/features/editor/hooks/useBackground"
import Input from "@/shared/ui/Input"
import Textarea from "@/shared/ui/Textarea"

export default function InformationForm() {
    const { details, update } = useBackgroundHook()

    return (
        <>
            <Textarea
                label="Address"
                value={details.defaultAddress}
                placeholder="Street, State, City, Zipcode, Country"
                onChange={event => update("defaultAddress", event.target.value)}
                isStretch={true}
            />

            <Input
                label="Email"
                value={details.defaultEmail}
                placeholder="mkgpdev@gmail.com"
                onChange={event => update("defaultEmail", event.target.value)}
                isStretch={true}
            />

            <Input
                type="number"
                label="Phone number"
                value={details.defaultPhoneNumber}
                placeholder="639123456789"
                onChange={event => update("defaultPhoneNumber", event.target.value)}
                isStretch={true}
            />
            
            <Input
                label="Github (Optional)"
                value={details.socialGithub}
                placeholder="mkgp-dev"
                onChange={event => update("socialGithub", event.target.value)}
                isStretch={true}
            />

            <Input
                label="Linkedin (Optional)"
                value={details.socialLinkedin}
                placeholder="mkgp-dev"
                onChange={event => update("socialLinkedin", event.target.value)}
                isStretch={true}
            />
        </>
    )
}