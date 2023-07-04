import { Agent, WACICredentialOfferSucceded, WACIProtocol } from "@extrimian/agent";
import { Injectable } from "@nestjs/common";
import { FileSystemStorage, MemoryStorage } from "./storage";

@Injectable()
export class WACIProtocolService {
    agent: Agent;

    constructor() {

    }

    setCurrentAgent(agent: Agent) {
        this.agent = agent;
    }

    getStorage() {
        return new FileSystemStorage({ filepath: "waci-protocol.json" });
    }

    getWaciProtocol() {
        return new WACIProtocol({
            storage: new FileSystemStorage({ filepath: "waci-protocol.json" }),
            issuer: {

                issueCredentials: async (waciInvitationId: string, holderId: string) => {
                    console.log("waciInvitationId", waciInvitationId);
                    return new WACICredentialOfferSucceded({
                        credentials: [
                            {
                                credential: {
                                    '@context': [
                                        'https://www.w3.org/2018/credentials/v1',
                                        'https://www.w3.org/2018/credentials/examples/v1',
                                        'https://w3id.org/security/bbs/v1',
                                    ],
                                    id: 'http://example.edu/credentials/58473',
                                    type: ['VerifiableCredential', 'AlumniCredential'],
                                    issuer: this.agent.identity.getOperationalDID().value,
                                    issuanceDate: new Date(),
                                    credentialSubject: {
                                        id: holderId,
                                        givenName: 'Jhon',
                                        familyName: 'Does',
                                    },
                                },
                                outputDescriptor: {
                                    id: 'alumni_credential_output',
                                    schema: 'https://schema.org/EducationalOccupationalCredential',
                                    display: {
                                        title: {
                                            path: ['$.name', '$.vc.name'],
                                            fallback: 'Alumni Credential',
                                        },
                                        subtitle: {
                                            path: ['$.class', '$.vc.class'],
                                            fallback: 'Alumni',
                                        },
                                        description: {
                                            text: 'Credencial que permite validar que es alumno del establecimiento',
                                        },
                                    },
                                    styles: {
                                        background: {
                                            color: '#ff0000',
                                        },
                                        thumbnail: {
                                            uri: 'https://dol.wa.com/logo.png',
                                            alt: 'Universidad Nacional',
                                        },
                                        hero: {
                                            uri: 'https://dol.wa.com/alumnos.png',
                                            alt: 'Alumnos de la universidad',
                                        },
                                        text: {
                                            color: '#d4d400',
                                        },
                                    },
                                }
                            }],
                        // inputDescriptors: undefined,
                        issuer: {
                            name: 'Universidad Nacional',
                            styles: {
                                thumbnail: {
                                    uri: 'https://dol.wa.com/logo.png',
                                    alt: 'Universidad Nacional',
                                },
                                hero: {
                                    uri: 'https://dol.wa.com/alumnos.png',
                                    alt: 'Alumnos de la universidad',
                                },
                                background: {
                                    color: '#ff0000',
                                },
                                text: {
                                    color: '#d4d400',
                                },
                            },
                        },
                        options: {
                            challenge: '508adef4-b8e0-4edf-a53d-a260371c1423',
                            domain: '9rf25a28rs96',
                        },
                    });
                },
            },
            verifier: {
                presentationDefinition: async (invitationId: string) => {
                    return {
                        frame: {
                            '@context': [
                                'https://www.w3.org/2018/credentials/v1',
                                'https://www.w3.org/2018/credentials/examples/v1',
                                'https://w3id.org/security/bbs/v1',
                            ],
                            type: ['VerifiableCredential', 'AlumniCredential'],
                            credentialSubject: {
                                '@explicit': true,
                                type: ['AlumniCredential'],
                                givenName: {},
                                familyName: {},
                            },
                        },
                        inputDescriptors: [
                            {
                                id: 'Alumni Credential',
                                name: 'AlumniCredential',
                                constraints: {
                                    fields: [
                                        {
                                            path: ['$.credentialSubject.givenName'],
                                            filter: {
                                                type: 'string',
                                            },
                                        },
                                        {
                                            path: ['$.credentialSubject.familyName'],
                                            filter: {
                                                type: 'string',
                                            },
                                        },
                                    ],
                                },
                            },
                        ],
                    };
                },
            },
        });
    }
}