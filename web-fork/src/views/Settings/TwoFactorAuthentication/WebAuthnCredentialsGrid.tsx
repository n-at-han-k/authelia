import { WebAuthnCredential } from "@models/WebAuthn";
import WebAuthnCredentialItem from "@views/Settings/TwoFactorAuthentication/WebAuthnCredentialItem";

interface Props {
    credentials: WebAuthnCredential[];
    handleInformation: (_index: number) => void;
    handleEdit: (_index: number) => void;
    handleDelete: (_index: number) => void;
}

const WebAuthnCredentialsGrid = function (props: Props) {
    return (
        <div className="flex flex-wrap gap-6">
            {props.credentials.map((credential, index) => (
                <div className="w-full md:w-1/2 xl:w-1/4" key={credential.id}>
                    <WebAuthnCredentialItem
                        index={index}
                        credential={credential}
                        handleInformation={props.handleInformation}
                        handleEdit={props.handleEdit}
                        handleDelete={props.handleDelete}
                    />
                </div>
            ))}
        </div>
    );
};

export default WebAuthnCredentialsGrid;
