export type Community = {
    _id: string;
    clerkId: string;
    name: string;
    username: string;
    email: string;
    password?: string;
    bio?: string;
    picture: string;
    location?: string;
    portfolioWebsite?: string;
    reputation?: string;
    joinedAt?: Date;
  };
  
  
  export type Experiment = {
    _id: string;
    year: number;
    aceYear: string;
    Branch: string;
    CCode: string;
    CName: string;
    ExpNo: number;
    ExpName: string;
    ExpDesc: string;
    ExpSoln: string;
    __v: number;
  };