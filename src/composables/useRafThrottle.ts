export function useRafThrottle<T extends (...a:any[])=>void>(fn:T){
    let ticking=false, last:any[]|null=null;
    return ((...a:any[])=>{
        last=a; if (ticking) return; ticking=true;
        requestAnimationFrame(()=>{ ticking=false; if (last) fn(...last); last=null; });
    }) as T;
}