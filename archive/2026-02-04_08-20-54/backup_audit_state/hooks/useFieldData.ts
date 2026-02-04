import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface WeatherLog {
    temp: number;
    wind: number;
    humidity: number;
    summary: string;
}

export interface ManpowerStats {
    civil: { present: number, planned: number };
    mep: { present: number, planned: number };
    management: { present: number, planned: number };
    total: number;
}

export const useFieldData = (projectId: string | null) => {
    const [weather, setWeather] = useState<WeatherLog | null>(null);
    const [manpower, setManpower] = useState<ManpowerStats | null>(null);
    const [activities, setActivities] = useState<any[]>([]);
    const [observations, setObservations] = useState<any[]>([]);
    const [ltiHours, setLtiHours] = useState(142050); // Default seed
    const [loading, setLoading] = useState(true);

    const fetchFieldData = async () => {
        try {
            // If no project selected, perform smart aggregate or just grab the first one
            // specific logic: if 'all', grab the first project with logs

            // 1. Fetch Latest Daily Log & Manpower
            const { data: logData, error: logError } = await supabase
                .from('site_logs')
                .select(`
                    *,
                    site_manpower (*)
                `)
                .order('log_date', { ascending: false })
                .limit(1)
                .single();

            if (logData) {
                setWeather({
                    temp: Number(logData.temp_celsius),
                    wind: Number(logData.wind_speed_kmh),
                    humidity: logData.humidity_percent,
                    summary: logData.weather_summary
                });

                const mp = logData.site_manpower || [];
                const civil = mp.find((m: any) => m.category === 'CIVIL') || { count_present: 0, count_planned: 0 };
                const mep = mp.find((m: any) => m.category === 'MEP') || { count_present: 0, count_planned: 0 };
                const mgmt = mp.find((m: any) => m.category === 'MANAGEMENT') || { count_present: 0, count_planned: 0 };

                setManpower({
                    civil: { present: civil.count_present, planned: civil.count_planned },
                    mep: { present: mep.count_present, planned: mep.count_planned },
                    management: { present: mgmt.count_present, planned: mgmt.count_planned },
                    total: civil.count_present + mep.count_present + mgmt.count_present
                });
            }

            // 2. Fetch Activities
            const { data: actData } = await supabase
                .from('site_activities')
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(10);

            if (actData) setActivities(actData);

            // 3. Fetch Observations
            const { data: obsData } = await supabase
                .from('safety_incidents')
                .select('*')
                .order('reported_at', { ascending: false })
                .limit(5);

            if (obsData) setObservations(obsData);

        } catch (error) {
            console.error("Field Data Sync Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFieldData();

        // Subscription for real-time updates
        const channel = supabase.channel('field_updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'site_activities' }, fetchFieldData)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'site_logs' }, fetchFieldData)
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [projectId]);

    return { weather, manpower, activities, observations, ltiHours, loading, refetch: fetchFieldData };
};
