import { useCertificateStore } from "../../hooks/useCertificateStore";
import CertificateForm from "../forms/CertificateForm";
import SortableList from "../../features/sortable/List";

export default function Certificate() {
    const { newCertificate } = useCertificateStore();

    return (
        <SortableList
            header="Certificate"
            section="certificates"
            renderItem={item => <CertificateForm item={item} />}
            onClick={newCertificate}
        />
    );
}