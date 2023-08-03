import { Observable, async, from } from "rxjs";
import { API_URL } from "../config";
import { AsyncAction } from "rxjs/internal/scheduler/AsyncAction";
import { IPlayerInfo } from "../interfaces/IPlayerInfo";
import { IShapeTypes } from "../interfaces/IShapeTypes";
import { IUsersScores } from "../interfaces/IUsersScores";

const fetchFromApi$ = <T>(
    path: string,
    requestInit?: RequestInit,
): Observable<T> => {
    return from(fetch(`${API_URL}/${path}`)
        .then(res => {
            if (!res.ok) {
                throw new Error("Failed to fetch")
            } else {
                return res.json();
            }
        })
        .catch(e => console.error(e))
    );
};

const fetchPlayerProfile$ = (
    username: string
): Observable<IUsersScores> => {
    return fetchFromApi$<IUsersScores>(`users?username=${username}`)
}

const fetchLeaderBoard$ = (): Observable<IUsersScores[]> => {
    return fetchFromApi$<IUsersScores[]>(`users?_sort=highscore&_order=desc&_limit=10`)
}

const fetchSprite$ = (): Observable<{
    path: string,
    shape: IShapeTypes[],
    board: string
}> => {
    return fetchFromApi$<{
        path: string,
        shape: IShapeTypes[],
        board: string
    }>(`sprites`)
}

const apiCall = async <T>(
    path: string,
    requestInit?: RequestInit,
): Promise<T> => {
    const res = await fetch(API_URL + path, requestInit);
    if (!res.ok) {
        throw new Error('An error occured while fetching: ' + res.status);
    }
    return res.json() as Promise<T>;
};

const putPlayerProfile = (player: IUsersScores): Promise<IUsersScores> => {
    let method: string;
    let route: string;

    if (player.id !== 0) {
        method = 'PUT';
        route = '/users'
    }

    return apiCall<IUsersScores>(route,{
        method,
        body:JSON.stringify(player),
        headers:{
            'Content-Type':'application/json',
        }
    });
}

export { fetchFromApi$, fetchPlayerProfile$, fetchLeaderBoard$, fetchSprite$,putPlayerProfile }