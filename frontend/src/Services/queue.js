import api from "./api";

export const getAvailableQueues = ()=>{
    return api.get('/queue/available')
};

export const joinQueue = (queueId)=>{
    return api.post('/queue/join',{
        queueId
    })
};

export const getMyQueueEntry = (queueId)=>{
    return api.get(`/queue/${queueId}/my-entry`)
};

export const getMyQueues = ()=>{
    return api.get('/queue/my')
};

export const getQueueEntries = (queueId)=>{
    return api.get(`/queue/${queueId}/entries`)
};

export const callNext = (queueId)=>{
    return api.post(`/queue/${queueId}/next`)
};

export const updateQueueStatus = (queueId,isActive)=>{
    return api.patch(`/queue/${queueId}/status`,{
        isActive,
    })
};

export const createQueue = (name)=>{
    return api.post('/queue/create',{
        name,
    })
};