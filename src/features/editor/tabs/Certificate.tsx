import { useCertificateHook } from "@/features/editor/hooks/useCertificate"
import CertificateForm from "@/features/editor/forms/CertificateForm"
import SortableList from "@/features/sortable/List"

export default function Certificate() {
    const { newCertificate } = useCertificateHook()

    return (
        <SortableList
            header="Certificate"
            section="certificates"
            renderItem={item => <CertificateForm item={item} />}
            onClick={newCertificate}
        />
    )
}