export interface SupportTransaction {
       $: {
           Date: string
       },
       Description: string,
       Value: string,
       Parties: {
        From: string,
        To: string,
       }
}