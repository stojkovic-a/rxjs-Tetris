import { Observable, from } from "rxjs";
import { API_URL } from "../config";
import { IShapeTypes, IUsersScores } from "../interfaces";

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
): Observable<IUsersScores[]> => {
    return fetchFromApi$<IUsersScores[]>(`users?username=${username}`)
}

const fetchHighScore$ = (): Observable<IUsersScores[]> => {
    return fetchFromApi$<IUsersScores[]>(`users?_sort=highscore&_order=desc&_limit=5`)
}

const fetchSprite$ = (): Observable<{
    path: string,
    shapes: IShapeTypes[],
    board: string
}> => {
    return fetchFromApi$<{
        path: string,
        shapes: IShapeTypes[],
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
        route = `/users/${player.id}`
    } else {
        method = 'POST';
        route = "/users"
    }

    return apiCall<IUsersScores>(route, {
        method,
        body: JSON.stringify(player),
        headers: {
            'Content-Type': 'application/json',
        }
    });
}

export { fetchFromApi$, fetchPlayerProfile$, fetchHighScore$, fetchSprite$, putPlayerProfile }