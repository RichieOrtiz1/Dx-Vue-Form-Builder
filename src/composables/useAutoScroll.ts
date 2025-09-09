export function useAutoScroll(container: HTMLElement, edge=48, speed=12){
    let raf=0;
    const step=(y:number)=>{
        const r=container.getBoundingClientRect();
        let dy=0;
        if (y < r.top + edge) dy = -speed;
        else if (y > r.bottom - edge) dy = speed;
        if (dy) { container.scrollTop += dy; raf = requestAnimationFrame(()=>step(y)); }
        else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    };
    return { onMove:(y:number)=>step(y), stop:()=>{ if(raf) cancelAnimationFrame(raf); raf=0; } };
}
