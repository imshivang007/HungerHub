import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

interface UseAppwriteOptions<T, P extends Record<string, string | number>> {
    fn: (params: P) => Promise<T>;
    params?: P;
    skip?: boolean;
}

interface UseAppwriteReturn<T, P> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: (newParams?: P) => Promise<void>;
}

const useAppwrite = <T, P extends Record<string, string | number>>({
    fn,
    params = {} as P,
    skip = false,
}: UseAppwriteOptions<T, P>): UseAppwriteReturn<T, P> => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(!skip);
    const [error, setError] = useState<string | null>(null);

    const latestParams = useRef<P>(params);

    const fetchData = useCallback(
        async (fetchParams: P) => {
            setLoading(true);
            setError(null);

            try {
                const result = await fn(fetchParams);
                setData(result);
            } catch (err: any) {
                const message = err?.message ?? "An unknown error occurred";
                setError(message);
                Alert.alert("Error", message);
            } finally {
                setLoading(false);
            }
        },
        [fn]
    );

    useEffect(() => {
        latestParams.current = params;

        if (!skip) {
            fetchData(params);
        }
    }, [params, skip, fetchData]);

    const refetch = async (newParams?: P) => {
        const paramsToUse = newParams ?? latestParams.current;
        latestParams.current = paramsToUse;
        return fetchData(paramsToUse);
    };

    return { data, loading, error, refetch };
};

export default useAppwrite;
