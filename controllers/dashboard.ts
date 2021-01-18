import { UserModel } from '../models/user';

export const getUsers = async (req: any, res: any) => {
    const next = req.query.next;

    let config: any = {
        limit : 7, 
        paginatedField: 'counter'
    };

    if(next !== 'false' && next.length > 0) {
        config.next = next;
    }

    (UserModel as any).paginateFN(config).then((result: any) => {
        const emails = result.results.map((element: any) => {
            return element.email;
        });
        const returnObj = {
            emails,
            next: result.next,
            previous: result.previous
        }
        res.json(returnObj);
    });


};