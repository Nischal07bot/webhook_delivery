export async function fetchapi(url: string, options: RequestInit={}): Promise<any> {
	const response=await fetch(url,{
        credentials: 'include',
        headers:{
            'Content-Type': 'application/json',
            ...(options?.headers || {})
        },
        ...options
    });

    if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
            const errorData = await response.json();
            if (errorData.message) {
                errorMessage = errorData.message;
            } else if (errorData.error) {
                errorMessage = errorData.error;
            }
        } catch {
            // If response is not JSON, use default error message
        }
        const error = new Error(errorMessage);
        (error as any).status = response.status;
        throw error;
    }
    return response.json();
}

export async function fetchapiWithAuth(url: string, apiKey: string, options: RequestInit={}): Promise<any> {
	const response=await fetch(url,{
        credentials: 'include',
        headers:{
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            ...(options?.headers || {})
        },
        ...options
    });

    if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
            const errorData = await response.json();
            if (errorData.message) {
                errorMessage = errorData.message;
            } else if (errorData.error) {
                errorMessage = errorData.error;
            }
        } catch {
            // If response is not JSON, use default error message
        }
        const error = new Error(errorMessage);
        (error as any).status = response.status;
        throw error;
    }
    return response.json();
}