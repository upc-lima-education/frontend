export enum JobStatus {
    Draft,     //Not ready yet
    Scheduled, //Programed to be seen in X time
    Active,    //Currently visible and users can apply to it
    Closed,    //Manually closed by the company
    Expired,   //Automatically closed by time 
    Archived   //Old job. Not relevant for the recommender
}