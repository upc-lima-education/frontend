export enum JobStatus {
    Draft,     //Not ready yet
    Scheduled, //Programed to be seen in X time
    Active,    //Currently visible and users can apply to it
    Closed     //Not visible for the employees
}