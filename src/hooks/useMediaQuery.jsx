import { useState, useEffect} from "react";


function useMediaQuery(query) {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
      const matchQueryList = window.matchMedia(query);
      function handleChange(e) {
        setMatches(e.matches);
      }
      matchQueryList.addEventListener("change", handleChange);
      return () => {
        matchQueryList.removeEventListener("change", handleChange);
      };
    }, [query]);

    useEffect(()=>{
        setMatches(window.matchMedia(query))
    }, [])

    return matches;
  }

  export default useMediaQuery