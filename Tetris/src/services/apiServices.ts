import { Observable, async, from } from "rxjs";
import { API_URL } from "../config";
import { AsyncAction } from "rxjs/internal/scheduler/AsyncAction";
import { IPlayerInfo } from "../interfaces/IPlayerInfo";
import { IShapeTypes } from "../interfaces/IShapeTypes";

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

const fetchUserProfile$ = (
    username: string
): Observable<IPlayerInfo> => {
    return fetchFromApi$<IPlayerInfo>(`users?username=${username}`)
}

const fetchLeaderBoard$ = (): Observable<IPlayerInfo[]> => {
    return fetchFromApi$<IPlayerInfo[]>(`users?_sort=highscore&_order=desc&_limit=10`)
}

const fetchSprite$ = (): Observable<{
    path: string,
    shape: IShapeTypes[]
}> => {
    return fetchFromApi$<{
        path: string,
        shape: IShapeTypes[]
    }>(`sprites`)
}


export { fetchFromApi$, fetchUserProfile$, fetchLeaderBoard$, fetchSprite$ }