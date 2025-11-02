import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';

const UsersIconDash: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.663M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
  </svg>
);

const ProductIconDash: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
);

const BillingIconDash: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h6m-3-3.75l-3 1.5m-3-1.5l3 1.5m-6-3l3-1.5m3 1.5l3-1.5M3 13.5l3-1.5m-3 1.5l3 1.5m12-3l3-1.5m-3 1.5l3 1.5M9 15l3-1.5m-3 1.5l3 1.5M12 12.75l-3 1.5m3-1.5l3 1.5M15 15l3-1.5m-3 1.5l3 1.5M9 12l3-1.5" />
    </svg>
);

const statCardConfig = [
    { title: "Total Buyers", key: 'buyers', linkTo: "/buyers", icon: UsersIconDash, bg: "bg-blue-100", text: "text-blue-600" },
    { title: "Total Products", key: 'products', linkTo: "/products", icon: ProductIconDash, bg: "bg-green-100", text: "text-green-600" },
    { title: "Total Bills Generated", key: 'bills', linkTo: "/billing", icon: BillingIconDash, bg: "bg-indigo-100", text: "text-indigo-600" }
];

const StatCard: React.FC<{ title: string; value: number; linkTo: string; icon: React.ElementType; bg: string; text: string; }> = ({ title, value, linkTo, icon: Icon, bg, text }) => (
    <Link to={linkTo} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 flex items-center group">
        <div className={`p-3 rounded-full ${bg}`}>
          <Icon className={`w-7 h-7 ${text}`} />
        </div>
        <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value.toLocaleString('en-IN')}</p>
        </div>
        <div className="ml-auto text-gray-300 group-hover:text-gray-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
        </div>
    </Link>
);


const DashboardPage: React.FC = () => {
    const { buyers, productsCount, bills, logs } = useAppContext();
    const stats = { buyers: buyers.length, products: productsCount, bills: bills.length };
    const latestLogs = logs.slice(0, 5);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCardConfig.map(card => (
                    <StatCard 
                        key={card.key}
                        title={card.title} 
                        value={stats[card.key as keyof typeof stats]} 
                        linkTo={card.linkTo} 
                        icon={card.icon}
                        bg={card.bg}
                        text={card.text}
                    />
                ))}
            </div>

            <div className="bg-white rounded-lg shadow-sm">
                 <h2 className="text-xl font-semibold text-gray-800 p-6 border-b">Recent Activity</h2>
                {latestLogs.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {latestLogs.map(log => (
                            <li key={log.id} className="p-4 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-slate-100 rounded-full mr-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.036 9.288-5.168" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">{log.action}</p>
                                            <p className="text-sm text-gray-500">{log.details}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-400">{new Date(log.timestamp).toLocaleDateString('en-IN')}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-12">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by adding a buyer or a product.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;