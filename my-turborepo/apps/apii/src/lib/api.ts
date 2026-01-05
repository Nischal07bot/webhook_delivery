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
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}